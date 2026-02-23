const express = require('express');
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/balance', walletController.getBalance);
router.get('/razorpay/key', (req, res) => res.json({ key: process.env.RAZORPAY_KEY_ID }));
router.post('/topup', walletController.topUp);

router.post('/razorpay/create-order', walletController.createRazorpayOrder);
router.post('/razorpay/verify', walletController.verifyRazorpayPayment);
router.get('/transactions', walletController.getTransactions);


module.exports = router;
