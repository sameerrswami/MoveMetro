const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

const sequelize = getSequelize();

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    wallet_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('CREDIT', 'DEBIT'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
        defaultValue: 'SUCCESS',
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reference_id: {
        type: DataTypes.STRING,
        allowNull: true, // Internal booking ID or external payment ID
    },
}, {
    tableName: 'wallet_transactions',
    timestamps: true,
    underscored: true,
});

module.exports = Transaction;
