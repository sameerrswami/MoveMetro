const stopService = require('../services/stopService');
const routeService = require('../services/routeService');

class AdminController {
    // === STOPS ===
    async createStop(req, res, next) {
        try {
            const stop = await stopService.createStop(req.body);
            res.status(201).json({ success: true, message: 'Stop created', data: stop });
        } catch (error) {
            next(error);
        }
    }

    async updateStop(req, res, next) {
        try {
            const stop = await stopService.updateStop(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Stop updated', data: stop });
        } catch (error) {
            next(error);
        }
    }

    async deleteStop(req, res, next) {
        try {
            await stopService.deleteStop(req.params.id);
            res.status(200).json({ success: true, message: 'Stop deleted' });
        } catch (error) {
            next(error);
        }
    }

    async getAllStops(req, res, next) {
        try {
            const stops = await stopService.getAllStops();
            res.status(200).json({ success: true, data: stops });
        } catch (error) {
            next(error);
        }
    }

    // === ROUTES ===
    async createRoute(req, res, next) {
        try {
            const route = await routeService.createRoute(req.body);
            res.status(201).json({ success: true, message: 'Route created', data: route });
        } catch (error) {
            next(error);
        }
    }

    async uploadRoutes(req, res, next) {
        try {
            const { routes } = req.body;
            const result = await routeService.uploadRoutes(routes);
            res.status(201).json({
                success: true,
                message: `${result.length} routes uploaded`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async refreshGraph(req, res, next) {
        try {
            const stats = await routeService.refreshGraph();
            res.status(200).json({
                success: true,
                message: 'Graph refreshed',
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    async getRoute(req, res, next) {
        try {
            const route = await routeService.getRouteById(req.params.id);
            res.status(200).json({ success: true, data: route });
        } catch (error) {
            next(error);
        }
    }

    async getAllRoutes(req, res, next) {
        try {
            const routes = await routeService.getAllRoutes();
            res.status(200).json({ success: true, data: routes });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();
