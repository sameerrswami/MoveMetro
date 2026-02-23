const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200: { description: System healthy }
 */
router.get('/', healthController.healthCheck);
router.get('/metrics', healthController.metrics);

module.exports = router;
