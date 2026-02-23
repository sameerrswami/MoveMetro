import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminPanel() {
    const [stops, setStops] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [activeTab, setActiveTab] = useState('stops');
    const [newStop, setNewStop] = useState({ name: '', code: '' });
    const [graphStats, setGraphStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [stopsRes, routesRes] = await Promise.all([
                API.get('/admin/stops'),
                API.get('/admin/routes'),
            ]);
            setStops(stopsRes.data.data || []);
            setRoutes(routesRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load admin data');
        }
    };

    const handleCreateStop = async () => {
        if (!newStop.name || !newStop.code) {
            toast.error('Name and code are required');
            return;
        }
        setLoading(true);
        try {
            await API.post('/admin/stops', newStop);
            toast.success('Stop created!');
            setNewStop({ name: '', code: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create stop');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStop = async (id) => {
        if (!window.confirm('Delete this stop?')) return;
        try {
            await API.delete(`/admin/stops/${id}`);
            toast.success('Stop deleted');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete stop');
        }
    };

    const handleRefreshGraph = async () => {
        setLoading(true);
        try {
            const { data } = await API.post('/admin/routes/refresh-graph');
            setGraphStats(data.data);
            toast.success('Graph refreshed!');
        } catch (error) {
            toast.error('Graph refresh failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSeedData = async () => {
        setLoading(true);
        try {
            const sampleRoutes = [
                {
                    name: 'Blue Line',
                    color: '#0052A5',
                    stops: [
                        { name: 'Dwarka Sector 21', code: 'DWRK21', travelTimeToNext: 3 },
                        { name: 'Dwarka', code: 'DWRK', travelTimeToNext: 4 },
                        { name: 'Rajouri Garden', code: 'RJGDN', travelTimeToNext: 3 },
                        { name: 'Rajiv Chowk', code: 'RJVCHK', travelTimeToNext: 4 },
                        { name: 'Barakhamba Road', code: 'BRKHMB', travelTimeToNext: 2 },
                        { name: 'Noida City Centre', code: 'NDACC', travelTimeToNext: 0 },
                    ],
                },
                {
                    name: 'Yellow Line',
                    color: '#FFCC00',
                    stops: [
                        { name: 'Samaypur Badli', code: 'SMPBD', travelTimeToNext: 4 },
                        { name: 'Kashmere Gate', code: 'KSHGT', travelTimeToNext: 3 },
                        { name: 'New Delhi', code: 'NWDLH', travelTimeToNext: 3 },
                        { name: 'Rajiv Chowk', code: 'RJVCHK', travelTimeToNext: 2 },
                        { name: 'Hauz Khas', code: 'HZKHS', travelTimeToNext: 4 },
                        { name: 'HUDA City Centre', code: 'HUDACC', travelTimeToNext: 0 },
                    ],
                },
                {
                    name: 'Red Line',
                    color: '#E42313',
                    stops: [
                        { name: 'Dilshad Garden', code: 'DLSHGD', travelTimeToNext: 4 },
                        { name: 'Welcome', code: 'WLCM', travelTimeToNext: 5 },
                        { name: 'Kashmere Gate', code: 'KSHGT', travelTimeToNext: 3 },
                        { name: 'Tis Hazari', code: 'TSHZR', travelTimeToNext: 3 },
                        { name: 'Rithala', code: 'RTHL', travelTimeToNext: 0 },
                    ],
                },
            ];

            await API.post('/admin/routes/upload', { routes: sampleRoutes });
            toast.success('Sample metro data loaded!');
            fetchData();
            handleRefreshGraph();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Seed failed');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'stops', label: 'Stops', icon: '📍', count: stops.length },
        { id: 'routes', label: 'Routes', icon: '🚇', count: routes.length },
        { id: 'system', label: 'System', icon: '⚙️' },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8 animate-fade-in">
                <h1 className="text-3xl font-bold text-white">Admin Panel ⚙️</h1>
                <p className="text-gray-500 mt-1">Manage metro network data and system settings</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-metro-600/20 text-metro-300 border border-metro-500/30'
                            : 'text-gray-400 hover:text-white bg-white/5 border border-white/10'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Stops Tab */}
            {activeTab === 'stops' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Create Stop */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Create New Stop</h2>
                        <div className="flex gap-3">
                            <input
                                value={newStop.name}
                                onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                                className="input-field flex-1"
                                placeholder="Stop name (e.g. Connaught Place)"
                            />
                            <input
                                value={newStop.code}
                                onChange={(e) => setNewStop({ ...newStop, code: e.target.value })}
                                className="input-field w-40"
                                placeholder="Code (e.g. CP)"
                            />
                            <button onClick={handleCreateStop} disabled={loading} className="btn-primary">
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Stops List */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">All Stops ({stops.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {stops.map((stop) => (
                                <div key={stop.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                    <div>
                                        <p className="text-white font-medium text-sm">{stop.name}</p>
                                        <p className="text-gray-500 text-xs font-mono">{stop.code}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteStop(stop.id)}
                                        className="text-red-400 hover:text-red-300 text-sm p-1"
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Routes Tab */}
            {activeTab === 'routes' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Metro Lines ({routes.length})</h2>
                        {routes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-4xl mb-3">🚇</p>
                                <p>No routes yet. Use "Load Sample Data" in System tab.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {routes.map((route) => (
                                    <div key={route.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div
                                            className="w-4 h-12 rounded-full"
                                            style={{ backgroundColor: route.color }}
                                        ></div>
                                        <div>
                                            <p className="text-white font-semibold">{route.name}</p>
                                            <p className="text-gray-500 text-xs">{route.color}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Graph Management</h2>
                        <div className="flex gap-3 mb-4">
                            <button onClick={handleRefreshGraph} disabled={loading} className="btn-primary flex items-center gap-2">
                                {loading ? '⏳' : '🔄'} Refresh Graph
                            </button>
                            <button onClick={handleSeedData} disabled={loading} className="btn-secondary flex items-center gap-2">
                                {loading ? '⏳' : '🌱'} Load Sample Data
                            </button>
                        </div>

                        {graphStats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-gray-500">Stops</p>
                                    <p className="text-2xl font-bold text-white">{graphStats.stops}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-gray-500">Edges</p>
                                    <p className="text-2xl font-bold text-white">{graphStats.edges}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-gray-500">Status</p>
                                    <p className="text-emerald-400 font-semibold">{graphStats.stops > 0 ? '🟢 Active' : '🔴 Empty'}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-gray-500">Last Built</p>
                                    <p className="text-white text-sm">{graphStats.lastBuilt ? new Date(graphStats.lastBuilt).toLocaleTimeString() : 'Never'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
