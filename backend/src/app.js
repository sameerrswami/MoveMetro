const express = require('express');
// Trigger restart for graph rebuild
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { metricsMiddleware } = require('./utils/metrics');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const routeRoutes = require('./routes/routeRoutes');
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');



const app = express();

// === Swagger Config ===
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MoveMetro API',
            version: '1.0.0',
            description: 'Production-grade Metro Booking Service API',
            contact: { name: 'MoveMetro Team' },
        },
        servers: [{ url: '/api/v1', description: 'API v1' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
});

// === Core Middleware ===
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(metricsMiddleware);
app.use(apiLimiter);

// === Swagger UI ===
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MoveMetro API Docs',
}));

// === API Routes ===
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/wallet', walletRoutes);



// === Root ===
app.get('/', (req, res) => {
    res.json({
        name: 'MoveMetro API',
        version: '1.0.0',
        docs: '/api-docs',
        health: '/api/v1/health',
    });
});

// === 404 Handler ===
app.use('*', (req, res) => {
    res.status(404).json({
        errorCode: 'NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
    });
});

// === Global Error Handler ===
app.use(errorHandler);

module.exports = app;
