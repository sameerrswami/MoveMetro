import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 mesh-gradient">
            {/* Background decorative elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-metro-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-metro-800/10 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-metro-500 to-metro-800 rounded-2xl text-3xl mb-4 shadow-xl shadow-metro-600/20">
                        🚇
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        MoveMetro
                    </h1>
                    <p className="text-gray-500 mt-1">Smart Metro Booking Service</p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>Sign In</>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-gray-500 text-sm">Don't have an account? </span>
                        <Link to="/register" className="text-metro-400 hover:text-metro-300 text-sm font-medium transition-colors">
                            Sign up
                        </Link>
                    </div>

                    {/* Demo credentials */}
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-gray-500 font-medium mb-2">DEMO CREDENTIALS</p>
                        <div className="space-y-1 text-xs text-gray-400">
                            <p>👤 User: <span className="text-white">user@movemetro.com</span> / <span className="text-white">user123</span></p>
                            <p>🔑 Admin: <span className="text-white">admin@movemetro.com</span> / <span className="text-white">admin123</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
