import React from 'react';

export default function BookingCard({ booking, onCancel }) {
    const createdAt = new Date(booking.created_at || booking.createdAt).toLocaleString();

    return (
        <div className="glass-card p-6 hover:border-metro-500/30 transition-all duration-500 group relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-metro-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-metro-500/10 transition-all duration-500"></div>

            <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-14 h-14 bg-gradient-to-br from-metro-500/20 to-metro-700/20 rounded-2xl flex items-center justify-center text-2xl border border-metro-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            🎫
                        </div>

                        {/* Details */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded uppercase tracking-widest font-bold">Ticket</span>
                                <span className="text-[10px] text-gray-500 font-mono">#{booking.id?.substring(0, 8)}</span>
                            </div>
                            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-metro-200 transition-colors">
                                {booking.sourceStop?.name || 'N/A'}
                                <span className="mx-2 text-gray-600 font-normal">→</span>
                                {booking.destinationStop?.name || 'N/A'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <span className="opacity-60">🕒</span> {createdAt}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <span className={booking.status === 'ACTIVE' ? 'badge-active' : 'badge-cancelled'}>
                            {booking.status}
                        </span>
                    </div>
                </div>

                {/* Journey Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Duration</p>
                        <p className="text-white font-bold text-sm">{booking.total_travel_time}m</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Stations</p>
                        <p className="text-white font-bold text-sm">{booking.total_stops}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Transfers</p>
                        <p className="text-white font-bold text-sm">{booking.total_transfers}</p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Valid for today</span>
                    </div>
                    {booking.status === 'ACTIVE' && onCancel && (
                        <button
                            onClick={(e) => { e.preventDefault(); onCancel(booking.id); }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors font-bold uppercase tracking-widest hover:underline decoration-red-500/30 underline-offset-4"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
