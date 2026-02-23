const { Wallet, Transaction, sequelize } = require('../models');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

class WalletService {
    async getOrCreateWallet(userId, passedTransaction = null) {
        let wallet = await Wallet.findOne({
            where: { user_id: userId },
            transaction: passedTransaction
        });
        if (!wallet) {
            wallet = await Wallet.create(
                { user_id: userId, balance: 100.00 },
                { transaction: passedTransaction }
            );
        }
        return wallet;
    }

    async getBalance(userId, passedTransaction = null) {
        const wallet = await this.getOrCreateWallet(userId, passedTransaction);
        return wallet.balance;
    }

    async topUp(userId, amount, paymentMethod = 'card', externalRef = null, passedTransaction = null) {
        const t = passedTransaction || await sequelize.transaction();
        try {
            const wallet = await this.getOrCreateWallet(userId, t);

            const newBalance = parseFloat(wallet.balance) + parseFloat(amount);

            await wallet.update({ balance: newBalance }, { transaction: t });

            const transaction = await Transaction.create({
                user_id: userId,
                wallet_id: wallet.id,
                amount: amount,
                type: 'CREDIT',
                status: 'SUCCESS',
                description: `Top-up via ${paymentMethod}`,
                reference_id: externalRef || `pay_${Math.random().toString(36).substr(2, 9)}`,
            }, { transaction: t });

            if (!passedTransaction) await t.commit();
            return { wallet, transaction };
        } catch (error) {
            if (!passedTransaction) await t.rollback();
            throw error;
        }
    }

    async deductBalance(userId, amount, description, referenceId, passedTransaction = null) {
        const t = passedTransaction || await sequelize.transaction();
        try {
            const wallet = await this.getOrCreateWallet(userId, t);

            if (parseFloat(wallet.balance) < parseFloat(amount)) {
                throw new AppError('Insufficient wallet balance', 400);
            }

            const newBalance = parseFloat(wallet.balance) - parseFloat(amount);
            await wallet.update({ balance: newBalance }, { transaction: t });

            await Transaction.create({
                user_id: userId,
                wallet_id: wallet.id,
                amount: amount,
                type: 'DEBIT',
                status: 'SUCCESS',
                description: description,
                reference_id: referenceId,
            }, { transaction: t });

            if (!passedTransaction) await t.commit();
            return true;
        } catch (error) {
            if (!passedTransaction) await t.rollback();
            throw error;
        }
    }

    async getTransactions(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { count, rows } = await Transaction.findAndCountAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });

        return {
            transactions: rows,
            pagination: {
                total: count,
                pages: Math.ceil(count / limit),
                page,
                limit
            }
        };
    }
}

module.exports = new WalletService();
