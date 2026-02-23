const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

const sequelize = getSequelize();

const Route = sequelize.define('Route', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            len: [2, 200],
            notEmpty: true,
        },
    },
    color: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
}, {
    tableName: 'routes',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['name'] },
    ],
});

module.exports = Route;
