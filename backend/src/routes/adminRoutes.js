const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { createStopValidator, createRouteValidator, uploadRoutesValidator } = require('../validators/adminValidator');
const validate = require('../middleware/validate');

const router = express.Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

// === STOPS ===
/**
 * @swagger
 * /api/v1/admin/stops:
 *   post:
 *     tags: [Admin]
 *     summary: Create a metro stop
 *     security: [{ bearerAuth: [] }]
 *   get:
 *     tags: [Admin]
 *     summary: List all stops
 *     security: [{ bearerAuth: [] }]
 */
router.post('/stops', createStopValidator, validate, adminController.createStop);
router.get('/stops', adminController.getAllStops);
router.put('/stops/:id', adminController.updateStop);
router.delete('/stops/:id', adminController.deleteStop);

// === ROUTES ===
/**
 * @swagger
 * /api/v1/admin/routes:
 *   post:
 *     tags: [Admin]
 *     summary: Create a metro route
 *     security: [{ bearerAuth: [] }]
 */
router.post('/routes', createRouteValidator, validate, adminController.createRoute);
router.post('/routes/upload', uploadRoutesValidator, validate, adminController.uploadRoutes);
router.post('/routes/refresh-graph', adminController.refreshGraph);
router.get('/routes', adminController.getAllRoutes);
router.get('/routes/:id', adminController.getRoute);

module.exports = router;
