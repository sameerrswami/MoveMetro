import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';

export default function Wallet() {

    const { balance, fetchBalance } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {

        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data } = await API.get('/wallet/transactions?limit=10');
            setTransactions(data.data.transactions || []);
        } catch (error) {
            toast.error('Failed to load transactions');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleTopUp = (e) => {
        e.preventDefault();
        const amount = parseFloat(topUpAmount);
        if (isNaN(amount) || amount <= 0) {
            return toast.error('Please enter a valid amount');
        }
        setShowPayment(true);
    };

    const handleFinalPayment = async (method) => {
        const amount = parseFloat(topUpAmount);
        setShowPayment(false);
        setLoading(true);

        try {
            if (method === 'UPI QR') {
                // For UPI QR, we perform the same "sandbox" style update since it's a manual verification flow
                await API.post('/wallet/topup', {
                    amount,
                    paymentMethod: 'UPI QR',
                    externalRef: `UPI_${Math.random().toString(36).substr(2, 9)}`
                });
                toast.success(`Request sent! ₹${amount} will be added after verification.`);
            } else {
                // Razorpay Logic (Existing)
                const { data: keyRes } = await API.get('/wallet/razorpay/key');
                const { data: orderRes } = await API.post('/wallet/razorpay/create-order', { amount });
                const order = orderRes.data;

                if (order.sandbox) {
                    toast.loading("Simulator: Processing payment...", { duration: 2000 });
                    setTimeout(async () => {
                        try {
                            await API.post('/wallet/razorpay/verify', {
                                razorpay_order_id: order.id,
                                razorpay_payment_id: `pay_sim_${Math.random().toString(36).substr(2, 9)}`,
                                razorpay_signature: 'simulated_signature',
                                amount: amount
                            });
                            toast.success(`[Simulator] Wallet topped up with ₹${amount}!`);
                            finishPayment();
                        } catch (err) { toast.error("Simulator: Payment failed"); }
                    }, 2000);
                    return;
                }

                const options = {
                    key: keyRes.key,
                    amount: order.amount,
                    currency: order.currency,
                    order_id: order.id,
                    name: "MoveMetro",
                    handler: async (response) => {
                        try {
                            await API.post('/wallet/razorpay/verify', { ...response, amount });
                            toast.success(`Successfully added ₹${amount}!`);
                            finishPayment();
                        } catch (err) { toast.error("Payment verification failed"); }
                    },
                    modal: { ondismiss: () => setLoading(false) }
                };
                new window.Razorpay(options).open();
            }

            if (method === 'UPI QR') finishPayment();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment failed');
            setLoading(false);
        }
    };

    const finishPayment = () => {
        setTopUpAmount('');
        fetchBalance();
        fetchTransactions();
        setLoading(false);
    };



    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8 animate-fade-in">
                <h1 className="text-3xl font-bold text-white">Metro Wallet 💳</h1>
                <p className="text-gray-500 mt-1">Manage your balance and view transaction history</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance & Top Up */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Current Balance Card */}
                    <div className="glass-card p-8 bg-gradient-to-br from-metro-600/20 to-accent-600/10 border-metro-500/20 relative overflow-hidden animate-slide-up">
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Available Balance</p>
                            <h2 className="text-5xl font-black text-white">₹{parseFloat(balance).toLocaleString()}</h2>
                            <p className="text-gray-500 text-xs mt-4 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Linked to your metro account
                            </p>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    </div>

                    {/* Quick Top Up */}
                    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <span>⚡</span> Fast Recharge
                        </h3>
                        <form onSubmit={handleTopUp} className="space-y-4">
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[100, 200, 500].map(amt => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setTopUpAmount(amt.toString())}
                                        className="py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-metro-600/20 hover:border-metro-500/30 transition-all text-xs"
                                    >
                                        +₹{amt}
                                    </button>
                                ))}
                            </div>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-metro-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    className="input-field pl-8"
                                    placeholder="Enter custom amount"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-4 text-sm font-bold tracking-widest uppercase"
                            >
                                {loading ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </form>
                        <div className="mt-6 flex flex-col items-center">
                            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-3">
                                {balance === 0 && !topUpAmount ? "Connect Real Keys in .env to disable Sandbox" : "Secured via Razorpay Checkout"}
                            </p>
                            <div className="flex gap-4 opacity-30 grayscale">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4" />
                            </div>
                        </div>


                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2">
                    <div className="glass-card h-full animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Transaction History</h3>
                            <button onClick={fetchTransactions} className="text-xs text-metro-400 hover:text-metro-300 font-bold uppercase tracking-widest">Refresh</button>
                        </div>

                        <div className="p-0">
                            {historyLoading ? (
                                <div className="p-12 text-center text-gray-500">Loading history...</div>
                            ) : transactions.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-4xl mb-4 opacity-20">📜</p>
                                    <p className="text-gray-500 text-sm">No transactions found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {transactions.map((tx) => (
                                        <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${tx.type === 'CREDIT'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {tx.type === 'CREDIT' ? '⬇️' : '⬆️'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-sm group-hover:text-metro-300 transition-colors">
                                                        {tx.description}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">
                                                        {new Date(tx.created_at).toLocaleString()} • {tx.reference_id}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-black ${tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-gray-200'
                                                    }`}>
                                                    {tx.type === 'CREDIT' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString()}
                                                </p>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black ${tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Payment Selection Modal */}
            {showPayment && (
                <PaymentModal
                    amount={topUpAmount}
                    onConfirm={handleFinalPayment}
                    onCancel={() => setShowPayment(false)}
                />
            )}
        </div>
    );
}

