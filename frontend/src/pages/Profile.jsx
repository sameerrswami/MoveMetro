import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Name cannot be empty');

        setLoading(true);
        try {
            const { data } = await API.patch('/users/profile', { name });
            updateUser(data.data);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setPasswordLoading(true);
        try {
            await API.post('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password change failed');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8 animate-fade-in text-center sm:text-left">
                <h1 className="text-3xl font-bold text-white">Your Profile 👤</h1>
                <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 flex flex-col items-center text-center animate-slide-up">
                        <div className="w-24 h-24 bg-gradient-to-br from-metro-500 to-metro-800 rounded-full flex items-center justify-center text-3xl text-white mb-4 shadow-xl shadow-metro-600/20">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                        <div className="mt-4 inline-flex items-center px-3 py-1 bg-metro-600/10 border border-metro-500/20 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-metro-500 mr-2"></span>
                            <span className="text-[10px] font-bold text-metro-400 uppercase tracking-widest">{user?.role}</span>
                        </div>
                    </div>

                    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Account Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Join Date</span>
                                <span className="text-white font-medium">{new Date(user?.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Account ID</span>
                                <span className="text-white font-mono text-[10px]">{user?.id.substring(0, 8)}...</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile & Security */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <span>📝</span> Basic Information
                        </h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2 font-heading">Full Name</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="Your Name"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-metro-400 transition-colors">👤</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={user?.email}
                                    className="input-field opacity-50 cursor-not-allowed"
                                    disabled
                                />
                                <p className="text-[10px] text-gray-600 mt-2">Email cannot be changed</p>
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto px-10">
                                    {loading ? 'Saving...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security */}
                    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <span>🔒</span> Security Settings
                        </h2>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2 font-heading">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="input-field"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2 font-heading">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="input-field"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2 font-heading">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="input-field"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={passwordLoading} className="btn-secondary w-full sm:w-auto px-10">
                                    {passwordLoading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
