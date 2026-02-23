const path = require('path');
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const env = require('./env');

let sequelize;

/**
 * Initialize Sequelize with PostgreSQL connection.
 * Supports both DATABASE_URL and individual connection parameters.
 */
const initDatabase = () => {
    if (sequelize) return sequelize;

    const isTest = process.env.NODE_ENV === 'test' || env.nodeEnv === 'test' || env.db.dialect === 'sqlite';

    if (isTest) {
        // Use SQLite in-memory for tests, or file for development fallback
        const storage = process.env.NODE_ENV === 'test'
            ? ':memory:'
            : path.join(process.cwd(), 'database.sqlite');

        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: storage,
            logging: false,
            dialectOptions: {
                // SQLite specific options
                mode: 6, // Read-write, create
                busyTimeout: 10000, // 10 seconds timeout for busy (locked) DB
            },
            hooks: {
                afterConnect: (connection) => {
                    // Enable WAL mode for better concurrency
                    connection.run('PRAGMA journal_mode=WAL;');
                    connection.run('PRAGMA synchronous=NORMAL;');
                }
            }
        });
    } else if (env.db.url) {
        sequelize = new Sequelize(env.db.url, {
            dialect: env.db.dialect,
            logging: env.nodeEnv === 'development' ? (msg) => logger.debug(msg) : false,
            pool: {
                max: 20,
                min: 2,
                acquire: 30000,
                idle: 10000,
            },
            define: {
                timestamps: true,
                underscored: true,
            },
        });
    } else {
        sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
            host: env.db.host,
            port: env.db.port,
            dialect: env.db.dialect,
            logging: env.nodeEnv === 'development' ? (msg) => logger.debug(msg) : false,
            pool: {
                max: 20,
                min: 2,
                acquire: 30000,
                idle: 10000,
            },
            define: {
                timestamps: true,
                underscored: true,
            },
        });
    }

    return sequelize;
};

/**
 * Connect to PostgreSQL and sync models.
 */
const connectDB = async () => {
    try {
        const db = initDatabase();
        await db.authenticate();
        logger.info(`Database connected: ${env.db.host}:${env.db.port}/${env.db.name}`);
        return db;
    } catch (error) {
        logger.error(`PostgreSQL connection error: ${error.message}`);
        throw error;
    }
};

/**
 * Sync all models (create tables).
 */
const syncDB = async (options = {}) => {
    const db = getSequelize();
    await db.sync(options);
    logger.info('Database tables synchronized');
};

/**
 * Get Sequelize instance.
 */
const getSequelize = () => {
    if (!sequelize) {
        initDatabase();
    }
    return sequelize;
};

/**
 * Close connection.
 */
const closeDB = async () => {
    if (sequelize) {
        await sequelize.close();
        sequelize = null;
        logger.info('PostgreSQL connection closed');
    }
};

module.exports = { connectDB, syncDB, getSequelize, closeDB, initDatabase };
