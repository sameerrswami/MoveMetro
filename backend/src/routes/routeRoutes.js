const express = require('express');
const routeController = require('../controllers/routeController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/routes/preview:
 *   get:
 *     tags: [Routes]
 *     summary: Preview optimal route between two stops
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: source
 *         in: query
 *         required: true
 *         schema: { type: string }
 *       - name: destination
 *         in: query
 *         required: true
 *         schema: { type: string }
 *       - name: mode
 *         in: query
 *         schema:
 *           type: string
 *           enum: [OPTIMAL, SHORTEST_TIME, MINIMUM_STOPS, MINIMUM_TRANSFERS]
 *     responses:
 *       200: { description: Route preview }
 */
router.get('/stops', authenticate, routeController.getAllStops);
router.get('/preview', authenticate, routeController.previewRoute);

module.exports = router;
