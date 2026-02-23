import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRModal({ booking, onClose }) {
    const qrText = booking.qr_string || booking.qrString || 'N/A';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="glass-card p-8 max-w-md w-full mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl text-3xl mb-3 shadow-xl shadow-emerald-600/20">
                        ✅
                    </div>
                    <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
                    <p className="text-gray-500 text-sm mt-1">Your metro ticket is ready</p>
                </div>

                {/* Booking Details */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Journey</span>
                        <span className="text-white font-bold text-sm">
                            {booking.sourceStop?.name || 'Station'} → {booking.destinationStop?.name || 'Station'}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Time</span>
                            <p className="text-white font-bold">{booking.total_travel_time || booking.totalTime}m</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Stops</span>
                            <p className="text-white font-bold">{booking.total_stops}</p>
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="p-6 bg-white rounded-3xl mb-6 shadow-2xl shadow-black/50">
                    <div className="flex flex-col items-center">
                        <div className="bg-white p-2 rounded-xl border-4 border-gray-100">
                            <QRCodeSVG
                                value={qrText}
                                size={180}
                                level="H"
                                includeMargin={true}
                                imageSettings={{
                                    src: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
                                    x: undefined,
                                    y: undefined,
                                    height: 30,
                                    width: 30,
                                    excavate: true,
                                }}
                            />
                        </div>
                        <div className="mt-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100 w-full">
                            <p className="text-gray-400 font-mono text-[8px] break-all leading-tight text-center">
                                {qrText}
                            </p>
                        </div>
                        <p className="text-gray-400 text-[10px] mt-3 font-bold uppercase tracking-[0.2em]">Scan at Turnstile</p>
                    </div>
                </div>


                {/* Booking ID */}
                <div className="text-center mb-6">
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Confirmation ID</p>
                    <p className="text-white font-mono text-xs opacity-60">{(booking.id || booking._id)?.toUpperCase()}</p>
                </div>

                <button onClick={onClose} className="btn-primary w-full py-4 rounded-2xl font-bold tracking-widest uppercase">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
