const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

const sequelize = getSequelize();

const Wallet = sequelize.define('Wallet', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 100.00, // Starting balance for new users
        allowNull: false,
    },
}, {
    tableName: 'wallets',
    timestamps: true,
    underscored: true,
});

module.exports = Wallet;
