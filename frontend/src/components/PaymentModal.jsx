import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function PaymentModal({ amount, onConfirm, onCancel }) {
    const [step, setStep] = useState(1); // 1: Select Method, 2: UPI QR, 3: Success
    const UPI_ID = "7906163577@paytm"; // Standard format for your number
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=MoveMetro&am=${amount}&cu=INR`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" onClick={onCancel}></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md glass-card overflow-hidden animate-zoom-in">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div>
                        <h3 className="text-xl font-bold text-white">Complete Payment</h3>
                        <p className="text-xs text-gray-400 mt-1">Transaction for ₹{amount}</p>
                    </div>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">✕</button>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400 mb-6">Choose your preferred payment method to add funds to your MoveMetro wallet.</p>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-metro-600/10 hover:border-metro-500/30 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">📱</div>
                                    <div className="text-left">
                                        <p className="font-bold text-white group-hover:text-metro-400 transition-colors">UPI / QR Code</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Fast & Secure</p>
                                    </div>
                                </div>
                                <span className="text-gray-600 group-hover:text-metro-400">→</span>
                            </button>

                            <button
                                onClick={() => onConfirm('Razorpay')}
                                className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-metro-600/10 hover:border-metro-500/30 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">💳</div>
                                    <div className="text-left">
                                        <p className="font-bold text-white group-hover:text-metro-400 transition-colors">Cards / Netbanking</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Powered by Razorpay</p>
                                    </div>
                                </div>
                                <span className="text-gray-600 group-hover:text-metro-400">→</span>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center space-y-6">
                            <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl shadow-metro-500/20">
                                <QRCodeSVG
                                    value={upiLink}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg",
                                        height: 30,
                                        width: 50,
                                        excavate: false,
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <p className="text-lg font-black text-white">Scan to Pay ₹{amount}</p>
                                <p className="text-xs text-gray-500">Scan this QR with PhonePe, Google Pay, or Paytm</p>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <button
                                    onClick={() => onConfirm('UPI QR')}
                                    className="btn-primary w-full py-4 text-sm font-bold uppercase tracking-widest"
                                >
                                    I have paid
                                </button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="mt-4 text-xs text-gray-500 hover:text-white font-bold uppercase tracking-widest"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Branding */}
                <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex items-center justify-center gap-4 grayscale opacity-40">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4" />
                </div>
            </div>
        </div>
    );
}
