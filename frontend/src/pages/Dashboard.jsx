import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import MetroMap from '../components/MetroMap';

export default function Dashboard() {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState({ bookings: 0, active: 0, cancelled: 0 });
    const [health, setHealth] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsRes, statsRes, healthRes] = await Promise.all([
                    API.get(isAdmin ? '/admin/stops' : '/bookings/my?limit=5'),
                    isAdmin ? Promise.resolve(null) : API.get('/bookings/stats'),
                    API.get('/health'),
                ]);

                if (!isAdmin) {
                    const bookings = bookingsRes.data.data.bookings || [];
                    const statsData = statsRes.data.data;
                    setRecentBookings(bookings);
                    setStats({
                        bookings: statsData.total,
                        active: statsData.ACTIVE,
                        cancelled: statsData.CANCELLED,
                    });
                }
                setHealth(healthRes.data);
            } catch (err) {
                console.error('Dashboard load error:', err);
            }
        };
        fetchData();
    }, [isAdmin]);

    const statCards = isAdmin ? [
        { label: 'Total Stations', value: health?.checks?.graph?.stops || 0, icon: '📍', color: 'from-metro-600 to-metro-800' },
        { label: 'System Uptime', value: `${Math.floor(health?.uptime / 3600)}h`, icon: '⏲️', color: 'from-emerald-600 to-emerald-800' },
        { label: 'Memory Usage', value: '64MB', icon: '🧠', color: 'from-accent-600 to-accent-800' },
    ] : [
        { label: 'Total Bookings', value: stats.bookings, icon: '🎫', color: 'from-metro-600 to-metro-800' },
        { label: 'Active', value: stats.active, icon: '✅', color: 'from-emerald-600 to-emerald-800' },
        { label: 'Cancelled', value: stats.cancelled, icon: '❌', color: 'from-red-600 to-red-800' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Welcome Section */}
            <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Welcome back, <span className="bg-gradient-to-r from-metro-400 to-metro-200 bg-clip-text text-transparent">{user?.name}</span> 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isAdmin ? 'System Administrator Overview' : "Here's your metro journey overview"}
                    </p>
                </div>
                {!isAdmin && (
                    <Link to="/book" className="btn-primary flex items-center gap-2">
                        <span>🚀</span> Start a New Journey
                    </Link>
                )}
            </div>

            {/* Metro Map Visualization */}
            <div className="mb-8 animate-slide-up">
                <MetroMap />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className="glass-card p-6 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">{card.label}</p>
                                <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                            </div>
                            <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {!isAdmin && (
                    <Link to="/book" className="glass-card p-6 group hover:border-metro-500/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-metro-500 to-metro-700 rounded-2xl flex items-center justify-center text-2xl group-hover:shadow-lg group-hover:shadow-metro-500/30 transition-all text-white">
                                🎫
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white group-hover:text-metro-300 transition-colors">Book a Ride</h3>
                                <p className="text-gray-500 text-sm">Find the optimal route & create a booking</p>
                            </div>
                        </div>
                    </Link>
                )}

                <Link to={isAdmin ? "/admin" : "/bookings"} className="glass-card p-6 group hover:border-accent-500/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl flex items-center justify-center text-2xl group-hover:shadow-lg group-hover:shadow-accent-500/30 transition-all text-white">
                            {isAdmin ? '⚙️' : '📋'}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-accent-300 transition-colors">
                                {isAdmin ? 'Admin Panel' : 'My Bookings'}
                            </h3>
                            <p className="text-gray-500 text-sm">
                                {isAdmin ? 'Manage network data and system' : 'View all your past & active bookings'}
                            </p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Bookings - Only for Users */}
            {!isAdmin && (
                <div className="glass-card p-6 animate-slide-up mb-8" style={{ animationDelay: '500ms' }}>
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Bookings</h2>
                    {recentBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-4xl mb-3">🚇</p>
                            <p>No bookings yet. Start your journey!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-metro-600/20 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-110">🎫</div>
                                        <div>
                                            <p className="text-white font-medium text-sm">
                                                {booking.sourceStop?.name || 'N/A'} → {booking.destinationStop?.name || 'N/A'}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {booking.total_stops} stops • {booking.total_travel_time} min • {booking.total_transfers} transfers
                                            </p>
                                        </div>
                                    </div>
                                    <span className={booking.status === 'ACTIVE' ? 'badge-active' : 'badge-cancelled'}>
                                        {booking.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* System Health */}
            {health && (
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white font-heading">System Status</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${health.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                            {health.status === 'healthy' ? 'System Operational' : 'Degraded Performance'}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Database</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${health.checks?.postgres === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <p className="font-semibold text-white text-sm">PostgreSQL</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Cache</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${health.checks?.redis === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                                <p className="font-semibold text-white text-sm">
                                    {health.checks?.redis === 'healthy' ? 'Redis Connected' : 'Local Fallback'}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Graph Network</p>
                            <p className="font-bold text-white text-lg">{health.checks?.graph?.stops || 0} <span className="text-xs font-normal text-gray-500">Stations</span></p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Server Uptime</p>
                            <p className="font-bold text-white text-lg">{Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
