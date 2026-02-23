const Razorpay = require('razorpay');
const env = require('../config/env');
const crypto = require('crypto');

class RazorpayService {
    constructor() {
        this.sandboxMode = !env.razorpay.keyId || env.razorpay.keyId.includes('placeholder');

        if (!this.sandboxMode) {
            this.instance = new Razorpay({
                key_id: env.razorpay.keyId,
                key_secret: env.razorpay.keySecret,
            });
        }
    }


    async createOrder(amount, receipt) {
        if (this.sandboxMode) {
            return {
                id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: receipt,
                status: 'created',
                sandbox: true
            };
        }

        if (!this.instance) throw new Error('Razorpay keys not configured');

        const options = {
            amount: Math.round(amount * 100), // Razorpay handles in paise (INR * 100)
            currency: 'INR',
            receipt: receipt,
        };

        return await this.instance.orders.create(options);
    }


    verifySignature(orderId, paymentId, signature) {
        if (orderId.startsWith('order_mock_')) {
            return true;
        }

        const hmac = crypto.createHmac('sha256', env.razorpay.keySecret);
        hmac.update(orderId + "|" + paymentId);
        const generatedSignature = hmac.digest('hex');
        return generatedSignature === signature;
    }

}

module.exports = new RazorpayService();
