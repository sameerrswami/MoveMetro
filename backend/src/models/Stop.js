const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

const sequelize = getSequelize();

const Stop = sequelize.define('Stop', {
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
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            is: /^[A-Z0-9_-]+$/i,
        },
        set(value) {
            this.setDataValue('code', value.toUpperCase().trim());
        },
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },
}, {

    tableName: 'stops',
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ['code'] },
        { fields: ['name'] },
    ],
});

module.exports = Stop;
