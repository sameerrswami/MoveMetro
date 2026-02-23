const promClient = require('prom-client');
const env = require('../config/env');

const register = new promClient.Registry();

promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register],
});

const routeComputationDuration = new promClient.Histogram({
    name: 'route_computation_duration_seconds',
    help: 'Duration of route computation in seconds',
    labelNames: ['mode', 'success'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
    registers: [register],
});

const bookingCounter = new promClient.Counter({
    name: 'bookings_total',
    help: 'Total number of bookings created',
    labelNames: ['status'],
    registers: [register],
});

const activeBookingsGauge = new promClient.Gauge({
    name: 'active_bookings',
    help: 'Number of active bookings',
    registers: [register],
});

const cacheHitCounter = new promClient.Counter({
    name: 'cache_hits_total',
    help: 'Total cache hits',
    labelNames: ['type'],
    registers: [register],
});

const cacheMissCounter = new promClient.Counter({
    name: 'cache_misses_total',
    help: 'Total cache misses',
    labelNames: ['type'],
    registers: [register],
});

const metricsMiddleware = (req, res, next) => {
    if (!env.enableMetrics) return next();
    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        httpRequestDuration.observe(
            { method: req.method, route, status_code: res.statusCode },
            duration
        );
    });
    next();
};

module.exports = {
    register,
    httpRequestDuration,
    routeComputationDuration,
    bookingCounter,
    activeBookingsGauge,
    cacheHitCounter,
    cacheMissCounter,
    metricsMiddleware,
};
