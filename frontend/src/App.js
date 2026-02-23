import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';


function ProtectedRoute({ children, adminOnly = false }) {

    const { user, loading, isAdmin } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-metro-400 text-xl">Loading...</div></div>;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;
    return children;
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen mesh-gradient">
            {user && <Navbar />}
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />


                <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
                <Toaster position="top-right" toastOptions={{
                    style: { background: 'rgba(30,30,40,0.95)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' },
                    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }} />
            </AuthProvider>
        </Router>
    );
}

export default App;
