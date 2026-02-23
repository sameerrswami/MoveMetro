import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, balance, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
        ...(isAdmin ? [] : [
            { to: '/book', label: 'Book Ride', icon: '🎫' },
            { to: '/bookings', label: 'My Bookings', icon: '📋' },
            { to: '/wallet', label: 'Wallet', icon: '💳' },
        ]),
        { to: '/profile', label: 'Profile', icon: '👤' },
        ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: '⚙️' }] : []),
    ];



    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 glass-card border-b border-white/10 rounded-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-metro-500 to-metro-700 rounded-xl flex items-center justify-center text-lg font-bold group-hover:shadow-lg group-hover:shadow-metro-500/30 transition-all">
                            🚇
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            MoveMetro
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(link.to)
                                    ? 'bg-metro-600/20 text-metro-300 border border-metro-500/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="mr-1.5">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-3">
                        {!isAdmin && (
                            <Link to="/wallet" className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full group hover:bg-emerald-500/20 transition-all">
                                <span className="text-emerald-500 text-xs">₹</span>
                                <span className="text-xs font-bold text-emerald-400">{parseFloat(balance).toLocaleString()}</span>
                            </Link>
                        )}
                        <div className="text-sm">
                            <span className="text-gray-500">Hello,</span>{' '}
                            <span className="font-medium text-white">{user?.name}</span>

                            {isAdmin && (
                                <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                                    ADMIN
                                </span>
                            )}
                        </div>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10">
                            Logout
                        </button>
                    </div>

                    {/* Mobile toggle */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-400 hover:text-white p-2">
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/10 py-3 px-4 animate-slide-up">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-4 py-3 rounded-xl text-sm font-medium mb-1 ${isActive(link.to) ? 'bg-metro-600/20 text-metro-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="mr-2">{link.icon}</span>{link.label}
                        </Link>
                    ))}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium mt-2">
                        🚪 Logout
                    </button>
                </div>
            )}
        </nav>
    );
}
