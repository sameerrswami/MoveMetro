const routeService = require('../services/routeService');

class RouteController {
    async getAllStops(req, res, next) {
        try {
            const stops = await require('../services/stopService').getAllStops();
            res.status(200).json({ success: true, data: stops });
        } catch (error) {
            next(error);
        }
    }

    async previewRoute(req, res, next) {
        try {
            const { source, destination, mode } = req.query;

            if (!source || !destination) {
                return res.status(400).json({
                    errorCode: 'VALIDATION_ERROR',
                    message: 'source and destination query parameters are required',
                    timestamp: new Date().toISOString(),
                });
            }

            const result = await routeService.previewRoute(source, destination, mode || 'OPTIMAL');
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RouteController();
