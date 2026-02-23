const User = require('../models/User');
const { AppError } = require('../utils/errors');

class UserService {
    async getProfile(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user.toSafeJSON();
    }

    async updateProfile(userId, updateData) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Only allow updating name for now
        if (updateData.name) {
            user.name = updateData.name;
        }

        await user.save();
        return user.toSafeJSON();
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.scope('withPassword').findByPk(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new AppError('Invalid current password', 401);
        }

        user.password_hash = newPassword;
        await user.save();
        return true;
    }
}

module.exports = new UserService();
