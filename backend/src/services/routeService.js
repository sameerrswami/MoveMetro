const { Route, RouteStop, Stop, sequelize } = require('../models');
const { getSequelize } = require('../config/db');
const GraphManager = require('../engine/GraphManager');
const PathOptimizer = require('../engine/PathOptimizer');
const cacheManager = require('../cache/cacheManager');
const { NotFoundError, NoPathError, SameStopError } = require('../utils/errors');
const logger = require('../utils/logger');
const env = require('../config/env');

class RouteService {
    constructor() {
        this.pathOptimizer = new PathOptimizer();
    }

    async createRoute({ name, color, stops }) {
        const db = getSequelize();
        const t = await db.transaction();

        try {
            // Create the route
            const route = await Route.create({ name, color }, { transaction: t });

            // If stops provided, create route-stop mappings
            if (stops && stops.length > 0) {
                const routeStops = stops.map((s, index) => ({
                    route_id: route.id,
                    stop_id: s.stopId,
                    stop_order: index,
                    travel_time_to_next: s.travelTimeToNext || 0,
                }));

                await RouteStop.bulkCreate(routeStops, { transaction: t });
            }

            await t.commit();

            // Rebuild graph
            const graphManager = GraphManager.getInstance();
            await graphManager.buildGraph();
            await cacheManager.invalidateAllRoutes();

            logger.info(`Route created: ${name} (${color})`);
            return route;
        } catch (error) {
            await t.rollback();
            logger.error(`Failed to create route: ${error.message}`);
            throw error;
        }
    }

    async uploadRoutes(data) {
        const results = [];
        const db = getSequelize();

        for (const routeData of data) {
            const t = await db.transaction();
            try {
                // Find or create stops
                const stopIds = [];
                for (const stopInfo of routeData.stops) {
                    const normalizedCode = stopInfo.code.toUpperCase().trim();
                    let [stop] = await Stop.findOrCreate({
                        where: { code: normalizedCode },
                        defaults: { name: stopInfo.name, code: normalizedCode },
                        transaction: t,
                    });
                    stopIds.push({ stopId: stop.id, travelTimeToNext: stopInfo.travelTimeToNext || 0 });
                }

                // Create route
                const route = await Route.create({
                    name: routeData.name,
                    color: routeData.color,
                }, { transaction: t });

                // Create route stops
                if (stopIds.length > 0) {
                    const routeStops = stopIds.map((s, index) => ({
                        route_id: route.id,
                        stop_id: s.stopId,
                        stop_order: index,
                        travel_time_to_next: s.travelTimeToNext || 0,
                    }));
                    await RouteStop.bulkCreate(routeStops, { transaction: t });
                }

                await t.commit();
                results.push(route);
            } catch (error) {
                await t.rollback();
                logger.error(`Failed to upload route ${routeData.name}: ${error.message}`);
                // Continue with other routes
            }
        }

        // Rebuild graph once after all uploads
        const graphManager = GraphManager.getInstance();
        await graphManager.buildGraph();
        await cacheManager.invalidateAllRoutes();

        return results;
    }

    async getRouteById(id) {
        const route = await Route.findByPk(id, {
            include: [
                {
                    model: RouteStop,
                    as: 'routeStops',
                    include: [{ model: Stop, as: 'stop' }],
                    order: [['stop_order', 'ASC']],
                },
            ],
        });

        if (!route) throw new NotFoundError(`Route with id ${id} not found`);
        return route;
    }

    async getAllRoutes() {
        return Route.findAll({ order: [['name', 'ASC']] });
    }

    async previewRoute(sourceCode, destinationCode, mode = 'OPTIMAL') {
        // Find stops by code
        const sourceStop = await Stop.findOne({ where: { code: sourceCode.toUpperCase() } });
        if (!sourceStop) throw new NotFoundError(`Stop with code ${sourceCode} not found`);

        const destStop = await Stop.findOne({ where: { code: destinationCode.toUpperCase() } });
        if (!destStop) throw new NotFoundError(`Stop with code ${destinationCode} not found`);

        const sourceId = sourceStop.id;
        const destId = destStop.id;

        if (sourceId === destId) throw new SameStopError();

        // Check cache first
        const cached = await cacheManager.getRouteCache(sourceId, destId, mode);
        if (cached) {
            logger.debug(`Route preview served from cache: ${sourceCode} -> ${destinationCode}`);
            return cached;
        }

        // Compute path
        const result = this.pathOptimizer.findOptimalPath(sourceId, destId, {
            mode,
            transferPenalty: env.transferPenalty,
        });

        if (!result) throw new NoPathError(sourceCode, destinationCode);

        // Enrich with stop and route details
        const enrichedResult = await this._enrichPathResult(result, sourceStop, destStop);

        // Cache the result
        await cacheManager.setRouteCache(sourceId, destId, mode, enrichedResult);

        return enrichedResult;
    }

    async refreshGraph() {
        const graphManager = GraphManager.getInstance();
        await graphManager.buildGraph();
        await cacheManager.invalidateAllRoutes();
        return graphManager.getStats();
    }

    async _enrichPathResult(result, sourceStop, destStop) {
        const { Op } = require('sequelize');

        // Fetch all stop details for the path
        const stopIds = result.path;
        const stops = await Stop.findAll({
            where: { id: { [Op.in]: stopIds } },
        });

        const stopMap = {};
        stops.forEach((s) => {
            stopMap[s.id] = {
                id: s.id,
                name: s.name,
                code: s.code,
                latitude: s.latitude,
                longitude: s.longitude
            };
        });


        // Fetch route details for segments
        const routeIds = result.segments.map((s) => s.routeId).filter(Boolean);
        const routes = await Route.findAll({
            where: { id: { [Op.in]: routeIds } },
        });

        const routeMap = {};
        routes.forEach((r) => {
            routeMap[r.id] = { id: r.id, name: r.name, color: r.color };
        });

        return {
            source: {
                id: sourceStop.id,
                name: sourceStop.name,
                code: sourceStop.code,
                latitude: sourceStop.latitude,
                longitude: sourceStop.longitude
            },
            destination: {
                id: destStop.id,
                name: destStop.name,
                code: destStop.code,
                latitude: destStop.latitude,
                longitude: destStop.longitude
            },

            totalTime: result.totalTime,
            totalStops: result.totalStops,
            totalTransfers: result.totalTransfers,
            path: result.path.map((id) => stopMap[id] || { id }),
            segments: result.segments.map((seg) => ({
                route: seg.routeId ? routeMap[seg.routeId] || { id: seg.routeId } : null,
                stops: seg.stops.map((id) => stopMap[id] || { id }),
                isInterchange: seg.isInterchange,
            })),
            fare: 20 + (result.totalStops * 5) + (result.totalTransfers * 10),
            algorithm: this.pathOptimizer.getStrategyName(),
        };

    }
}

module.exports = new RouteService();
