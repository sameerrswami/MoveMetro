const userService = require('../services/userService');

class UserController {
    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const profile = await userService.getProfile(userId);
            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { name } = req.body;
            const updatedProfile = await userService.updateProfile(userId, { name });
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedProfile,
            });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;
            await userService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: 'Password changed successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
