const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const sequelize = getSequelize();

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [2, 100],
            notEmpty: true,
        },
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true,
        },
        set(value) {
            this.setDataValue('email', value.toLowerCase().trim());
        },
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('USER', 'ADMIN'),
        defaultValue: 'USER',
        allowNull: false,
    },
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ['email'] },
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                const salt = await bcrypt.genSalt(12);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                const salt = await bcrypt.genSalt(12);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        },
    },
    defaultScope: {
        attributes: { exclude: ['password_hash'] },
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password_hash'] },
        },
    },
});

/**
 * Compare a candidate password against the stored hash.
 */
User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
};

/**
 * Return safe user JSON (without password).
 */
User.prototype.toSafeJSON = function () {
    const values = this.toJSON();
    delete values.password_hash;
    return values;
};

module.exports = User;
