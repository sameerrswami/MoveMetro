const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);

module.exports = router;
