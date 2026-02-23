const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

const sequelize = getSequelize();

const RouteStop = sequelize.define('RouteStop', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    route_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'routes',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    stop_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'stops',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    stop_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    travel_time_to_next: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
}, {
    tableName: 'route_stops',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['route_id', 'stop_order'] },
        { fields: ['stop_id'] },
        { unique: true, fields: ['route_id', 'stop_id'] },
        { fields: ['route_id'] },
    ],
});

module.exports = RouteStop;
