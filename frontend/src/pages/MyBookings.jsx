import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import BookingCard from '../components/BookingCard';
import toast from 'react-hot-toast';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const fetchBookings = async (page = 1) => {
        setLoading(true);
        try {
            const { data } = await API.get(`/bookings/my?page=${page}&limit=10`);
            setBookings(data.data.bookings || []);
            setPagination(data.data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        try {
            await API.patch(`/bookings/${bookingId}/cancel`);
            toast.success('Booking cancelled');
            fetchBookings(pagination.page);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cancel failed');
        }
    };

    const filteredBookings = filter === 'ALL'
        ? bookings
        : bookings.filter((b) => b.status === filter);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Bookings 📋</h1>
                    <p className="text-gray-500 mt-1">{pagination.total} total bookings</p>
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    {['ALL', 'ACTIVE', 'CANCELLED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f
                                ? 'bg-metro-600/20 text-metro-300 border border-metro-500/30'
                                : 'text-gray-400 hover:text-white bg-white/5 border border-white/10'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-metro-500/10 border-t-metro-500 rounded-full animate-spin"></div>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="glass-card p-16 text-center animate-fade-in border-dashed border-white/10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="text-5xl opacity-30">📋</div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto text-sm">
                        {filter === 'ALL' ? "You haven't made any bookings yet. Start by booking your first ride!" : `You don't have any ${filter.toLowerCase()} bookings at the moment.`}
                    </p>
                    {filter === 'ALL' && (
                        <Link to="/book" className="btn-primary inline-block mt-8">
                            Book Your First Ride
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBookings.map((booking, i) => (
                        <div key={booking.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                            <BookingCard booking={booking} onCancel={handleCancel} />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => fetchBookings(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="btn-secondary text-sm disabled:opacity-30"
                    >
                        ← Previous
                    </button>
                    <span className="text-gray-400 text-sm px-4">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => fetchBookings(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="btn-secondary text-sm disabled:opacity-30"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
