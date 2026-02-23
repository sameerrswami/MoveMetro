import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import QRModal from '../components/QRModal';
import RoutePreview from '../components/RoutePreview';
import TransitMap from '../components/TransitMap';
import { Link } from 'react-router-dom';

export default function BookingPage() {
    const { balance, fetchBalance } = useAuth();
    const [stops, setStops] = useState([]);

    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [mode, setMode] = useState('OPTIMAL');
    const [viewMode, setViewMode] = useState('TIMELINE'); // 'TIMELINE' or 'MAP' default to timeline
    const [preview, setPreview] = useState(null);

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        const fetchStops = async () => {
            try {
                const { data } = await API.get('/routes/stops');
                setStops(data.data || []);
            } catch (error) {
                console.error('Failed to fetch stops:', error);
                toast.error('Could not load metro stations. Please try again later.');
                setStops([]);
            }
        };
        fetchStops();
    }, []);

    const handlePreview = async () => {
        if (!source || !destination) {
            toast.error('Please select both source and destination');
            return;
        }
        if (source === destination) {
            toast.error('Source and destination cannot be the same');
            return;
        }

        setPreviewing(true);
        setPreview(null);
        try {
            const sourceCode = stops.find((s) => s.id === source)?.code || source;
            const destCode = stops.find((s) => s.id === destination)?.code || destination;
            const { data } = await API.get(`/routes/preview?source=${sourceCode}&destination=${destCode}&mode=${mode}`);
            setPreview(data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Route preview failed');
        } finally {
            setPreviewing(false);
        }
    };

    const handleBook = async () => {
        if (!preview) {
            toast.error('Preview a route first');
            return;
        }

        if (balance < preview.fare) {
            toast.error('Insufficient wallet balance!');
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.post('/bookings', {
                sourceStopId: source,
                destinationStopId: destination,
                mode,
            }, {
                headers: { 'x-idempotency-key': `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
            });
            setBooking(data.data);
            setShowQR(true);
            toast.success('Booking created successfully!');
            fetchBalance(); // Refresh navbar balance
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };


    const modes = [
        { value: 'OPTIMAL', label: 'Optimal', desc: 'Best balance of time & transfers', icon: '⚡' },
        { value: 'SHORTEST_TIME', label: 'Fastest', desc: 'Minimum travel time', icon: '🏃' },
        { value: 'MINIMUM_STOPS', label: 'Fewest Stops', desc: 'Minimum number of stops', icon: '📍' },
        { value: 'MINIMUM_TRANSFERS', label: 'Fewest Transfers', desc: 'Minimum line changes', icon: '🔄' },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8 animate-fade-in">
                <h1 className="text-3xl font-bold text-white">Book a Ride 🎫</h1>
                <p className="text-gray-500 mt-1">Find the optimal route and create your booking</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Booking Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Source & Destination */}
                    <div className="glass-card p-6 animate-slide-up">
                        <h2 className="text-lg font-semibold text-white mb-4 font-heading">Journey Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">📍 From</label>
                                <select
                                    id="booking-source"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    className="select-field text-white [&>option]:text-black"
                                >
                                    <option value="" className="text-black">Select source station</option>
                                    {stops.map((s) => (
                                        <option key={s.id} value={s.id} className="text-black">{s.name} ({s.code})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Swap button */}
                            <div className="flex justify-center -my-2 relative z-10">
                                <button
                                    onClick={() => { const tmp = source; setSource(destination); setDestination(tmp); }}
                                    className="p-2.5 rounded-full bg-metro-600/10 hover:bg-metro-600/20 border border-metro-500/20 text-metro-400 transition-all hover:rotate-180 duration-500 shadow-xl backdrop-blur-md"
                                >
                                    ↕
                                </button>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">🏁 To</label>
                                <select
                                    id="booking-destination"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="select-field text-white [&>option]:text-black"
                                >
                                    <option value="" className="text-black">Select destination station</option>
                                    {stops.map((s) => (
                                        <option key={s.id} value={s.id} className="text-black">{s.name} ({s.code})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <h2 className="text-lg font-semibold text-white mb-4 font-heading text-sm">Optimization</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {modes.map((m) => (
                                <button
                                    key={m.value}
                                    onClick={() => setMode(m.value)}
                                    className={`p-3 rounded-2xl text-left transition-all duration-300 border ${mode === m.value
                                        ? 'bg-metro-600/20 border-metro-500/40 text-white shadow-lg shadow-metro-600/10'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <span className="text-lg">{m.icon}</span>
                                    <p className="text-xs font-bold mt-1 uppercase tracking-tight">{m.label}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{m.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        {preview && balance < preview.fare && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                                <span className="text-lg">⚠️</span>
                                <div>
                                    <p className="text-xs font-bold text-red-400 uppercase tracking-tight">Insufficient Balance</p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Your current balance is ₹{balance}. This journey costs ₹{preview.fare}.
                                        Please <Link to="/wallet" className="text-metro-400 underline hov:text-metro-300">top up your wallet</Link> to book.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                id="preview-route-btn"
                                onClick={handlePreview}
                                disabled={previewing || !source || !destination}
                                className="btn-secondary flex-1 flex items-center justify-center gap-2 py-4"
                            >
                                {previewing ? (
                                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <span className="text-lg">🔍</span>
                                        <span>Preview</span>
                                    </>
                                )}
                            </button>
                            <button
                                id="book-ride-btn"
                                onClick={handleBook}
                                disabled={loading || !preview || balance < preview.fare}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 py-4"
                            >
                                {loading ? (
                                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <span className="text-lg">🎫</span>
                                        <span>Book Ticket</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>

                {/* Route Preview */}
                <div className="lg:col-span-3 space-y-4">
                    {preview && (
                        <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
                            <button
                                onClick={() => setViewMode('MAP')}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'MAP' ? 'bg-metro-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                🗺️ Real Map
                            </button>
                            <button
                                onClick={() => setViewMode('TIMELINE')}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'TIMELINE' ? 'bg-metro-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                📅 Status
                            </button>
                        </div>
                    )}

                    {preview ? (
                        <div className="animate-fade-in">
                            {viewMode === 'MAP' ? (
                                <TransitMap pathData={preview} />
                            ) : (
                                <RoutePreview data={preview} />
                            )}
                        </div>
                    ) : (
                        <div className="glass-card p-12 flex flex-col items-center justify-center text-center animate-fade-in min-h-[450px] border-dashed border-white/10">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <div className="text-6xl grayscale opacity-30">🗺️</div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Ready to explore?</h3>
                            <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                                Select your starting point and destination to see the fastest way through the metro network.
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* QR Modal */}
            {showQR && booking && (
                <QRModal booking={booking} onClose={() => setShowQR(false)} />
            )}
        </div>
    );
}
