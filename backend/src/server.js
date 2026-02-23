const app = require('./app');
const { connectDB, closeDB, syncDB } = require('./config/db');
const { connectRedis, disconnectRedis } = require('./config/redis');
const GraphManager = require('./engine/GraphManager');
const logger = require('./utils/logger');
const env = require('./config/env');

const startServer = async () => {
    try {
        // Connect to PostgreSQL
        await connectDB();

        // Sync models (in dev, this creates tables. In prod, use migrations)
        if (env.nodeEnv !== 'production' && env.nodeEnv !== 'test') {
            await syncDB();
        }

        // Connect to Redis
        connectRedis();

        // Build the metro graph from database
        const graphManager = GraphManager.getInstance();
        try {
            await graphManager.buildGraph();
        } catch (err) {
            logger.warn(`Initial graph build failed (may be empty DB): ${err.message}`);
        }

        // Start HTTP server
        const server = app.listen(env.port, () => {
            logger.info(`🚇 MoveMetro server running on port ${env.port}`);
            logger.info(`📚 API Docs: http://localhost:${env.port}/api-docs`);
            logger.info(`💚 Health: http://localhost:${env.port}/api/v1/health`);
            logger.info(`🌍 Environment: ${env.nodeEnv}`);
        });

        // Graceful shutdown
        const shutdown = async (signal) => {
            logger.info(`${signal} received. Shutting down gracefully...`);

            server.close(async () => {
                try {
                    await disconnectRedis();
                    await closeDB();
                    logger.info('All connections closed. Process exiting.');
                    process.exit(0);
                } catch (err) {
                    logger.error(`Error during shutdown: ${err.message}`);
                    process.exit(1);
                }
            });

            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 30000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        process.on('unhandledRejection', (reason) => {
            logger.error(`Unhandled Rejection: ${reason}`);
        });

        process.on('uncaughtException', (error) => {
            logger.error(`Uncaught Exception: ${error.message}`);
            console.error(error);
            process.exit(1);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
