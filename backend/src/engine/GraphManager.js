const { RouteStop } = require('../models');
const logger = require('../utils/logger');

/**
 * GraphManager - Singleton pattern
 * Manages the metro network as an adjacency list graph.
 * Loads from DB, caches in memory, rebuilds on updates.
 */
class GraphManager {
    constructor() {
        if (GraphManager._instance) {
            return GraphManager._instance;
        }
        // adjacencyList: Map<stopId, Array<{ to: stopId, travelTime: number, routeId: string }>>
        this.adjacencyList = new Map();
        this.stopCount = 0;
        this.edgeCount = 0;
        this.lastBuilt = null;
        this.isBuilding = false;
        GraphManager._instance = this;
    }

    static getInstance() {
        if (!GraphManager._instance) {
            new GraphManager();
        }
        return GraphManager._instance;
    }

    /**
     * Build adjacency list from database route-stop data.
     * Edges are bidirectional (metro lines go both ways).
     */
    async buildGraph() {
        if (this.isBuilding) {
            logger.warn('Graph build already in progress, skipping...');
            return;
        }

        this.isBuilding = true;
        const startTime = Date.now();

        try {
            logger.info('Building metro graph from database...');

            // Fetch all route-stops sorted by route and order using Sequelize
            const routeStops = await RouteStop.findAll({
                order: [
                    ['route_id', 'ASC'],
                    ['stop_order', 'ASC'],
                ],
                raw: true,
            });

            const newAdjList = new Map();
            let edgeCount = 0;

            // Group route stops by route
            const routeGroups = {};
            for (const rs of routeStops) {
                const routeKey = rs.route_id;
                if (!routeGroups[routeKey]) {
                    routeGroups[routeKey] = [];
                }
                routeGroups[routeKey].push(rs);
            }

            // Build edges for each route
            for (const routeId of Object.keys(routeGroups)) {
                const stops = routeGroups[routeId];

                for (let i = 0; i < stops.length - 1; i++) {
                    const currentStopId = stops[i].stop_id;
                    const nextStopId = stops[i + 1].stop_id;
                    const travelTime = stops[i].travel_time_to_next || 1;

                    // Ensure both stops are in adjacency list
                    if (!newAdjList.has(currentStopId)) newAdjList.set(currentStopId, []);
                    if (!newAdjList.has(nextStopId)) newAdjList.set(nextStopId, []);

                    // Add bidirectional edges
                    newAdjList.get(currentStopId).push({
                        to: nextStopId,
                        travelTime,
                        routeId,
                    });
                    newAdjList.get(nextStopId).push({
                        to: currentStopId,
                        travelTime,
                        routeId,
                    });
                    edgeCount += 2;
                }

                // Also add terminal stops that might have no next
                const lastStop = stops[stops.length - 1];
                const lastStopId = lastStop.stop_id;
                if (!newAdjList.has(lastStopId)) newAdjList.set(lastStopId, []);
            }

            // Atomic swap
            this.adjacencyList = newAdjList;
            this.stopCount = newAdjList.size;
            this.edgeCount = edgeCount;
            this.lastBuilt = new Date();

            const elapsed = Date.now() - startTime;
            logger.info(
                `Graph built: ${this.stopCount} stops, ${this.edgeCount} edges in ${elapsed}ms`
            );
        } catch (error) {
            logger.error(`Graph build failed: ${error.message}`);
            throw error;
        } finally {
            this.isBuilding = false;
        }
    }

    getNeighbors(stopId) {
        return this.adjacencyList.get(stopId) || [];
    }

    hasStop(stopId) {
        return this.adjacencyList.has(stopId);
    }

    getAllStopIds() {
        return Array.from(this.adjacencyList.keys());
    }

    getStats() {
        return {
            stops: this.stopCount,
            edges: this.edgeCount,
            lastBuilt: this.lastBuilt,
            isBuilding: this.isBuilding,
        };
    }

    getAdjacencyList() {
        return this.adjacencyList;
    }

    clear() {
        this.adjacencyList = new Map();
        this.stopCount = 0;
        this.edgeCount = 0;
        this.lastBuilt = null;
    }
}

// Reset for testing
GraphManager._instance = null;
GraphManager.resetInstance = () => {
    GraphManager._instance = null;
};

module.exports = GraphManager;
