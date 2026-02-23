const walletService = require('../services/walletService');
const razorpayService = require('../services/razorpayService');


class WalletController {
    async getBalance(req, res, next) {
        try {
            const balance = await walletService.getBalance(req.user.id);
            res.status(200).json({
                success: true,
                data: { balance }
            });
        } catch (error) {
            next(error);
        }
    }

    async topUp(req, res, next) {
        try {
            const { amount, paymentMethod } = req.body;
            if (!amount || amount <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid amount' });
            }

            const result = await walletService.topUp(req.user.id, amount, paymentMethod);
            res.status(200).json({
                success: true,
                message: 'Wallet topped up successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async createRazorpayOrder(req, res, next) {
        try {
            const { amount } = req.body;
            if (!amount || amount <= 0) throw new Error('Invalid amount');

            const receipt = `rcpt_${Date.now()}`;
            const order = await razorpayService.createOrder(amount, receipt);

            res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyRazorpayPayment(req, res, next) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

            const isValid = razorpayService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

            if (!isValid) {
                return res.status(400).json({ success: false, message: 'Invalid payment signature' });
            }

            // On success, update the actual wallet
            const result = await walletService.topUp(req.user.id, amount, 'Razorpay', razorpay_payment_id);

            res.status(200).json({
                success: true,
                message: 'Payment verified and wallet updated',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }


    async getTransactions(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await walletService.getTransactions(req.user.id, page, limit);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new WalletController();
