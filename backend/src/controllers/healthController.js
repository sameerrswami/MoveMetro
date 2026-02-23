const { getSequelize } = require('../config/db');
const { getRedisClient } = require('../config/redis');
const GraphManager = require('../engine/GraphManager');
const { register } = require('../utils/metrics');

class HealthController {
    async healthCheck(req, res) {
        const checks = {};

        // PostgreSQL
        try {
            const db = getSequelize();
            await db.authenticate();
            checks.postgres = 'healthy';
        } catch (error) {
            checks.postgres = 'unhealthy';
        }

        // Redis
        try {
            const redis = getRedisClient();
            if (redis) {
                await redis.ping();
                checks.redis = 'healthy';
            } else {
                checks.redis = 'unavailable';
            }
        } catch {
            checks.redis = 'unhealthy';
        }

        // Graph
        const graph = GraphManager.getInstance();
        const stats = graph.getStats();
        checks.graph = {
            status: stats.stops > 0 ? 'loaded' : 'empty',
            stops: stats.stops,
            edges: stats.edges,
            lastBuilt: stats.lastBuilt,
        };

        const isHealthy =
            checks.postgres === 'healthy' &&
            (checks.redis === 'healthy' || checks.redis === 'unavailable' || checks.redis === 'unhealthy');

        res.status(isHealthy ? 200 : 503).json({
            status: isHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks,
        });
    }

    async metrics(req, res) {
        try {
            const metrics = await register.metrics();
            res.set('Content-Type', register.contentType);
            res.send(metrics);
        } catch (error) {
            res.status(500).send('Error collecting metrics');
        }
    }
}

module.exports = new HealthController();
