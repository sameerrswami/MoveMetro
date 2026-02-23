const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

const sequelize = getSequelize();

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    source_stop_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'stops',
            key: 'id',
        },
    },
    destination_stop_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'stops',
            key: 'id',
        },
    },
    total_travel_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    total_stops: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    total_transfers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    route_snapshot: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    qr_string: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'CANCELLED'),
        defaultValue: 'ACTIVE',
        allowNull: false,
    },
    idempotency_key: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: true,
    },
}, {
    tableName: 'bookings',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id', 'created_at'] },
        { unique: true, fields: ['idempotency_key'], where: { idempotency_key: { [require('sequelize').Op.ne]: null } } },
        { fields: ['source_stop_id', 'destination_stop_id'] },
        { fields: ['status'] },
    ],
});

module.exports = Booking;
