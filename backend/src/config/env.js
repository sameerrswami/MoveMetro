require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'movemetro',
    user: process.env.DB_USER || 'movemetro',
    password: process.env.DB_PASSWORD || 'movemetro_pass',
    dialect: process.env.DB_DIALECT || 'postgres',
    url: process.env.DATABASE_URL || null,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  qrHmacSecret: process.env.QR_HMAC_SECRET || 'default-qr-secret',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },
  transferPenalty: parseInt(process.env.TRANSFER_PENALTY) || 5,
  enableMetrics: process.env.ENABLE_METRICS === 'true',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
};


module.exports = env;
