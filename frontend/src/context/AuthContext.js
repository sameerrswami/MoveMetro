import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
                fetchBalance();
            } catch {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const fetchBalance = async () => {
        try {
            const { data } = await API.get('/wallet/balance');
            setBalance(data.data.balance);
        } catch (err) {
            console.error('Failed to fetch balance');
        }
    };


    const login = async (email, password) => {
        const { data } = await API.post('/auth/login', { email, password });
        const userData = data.data;
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken);
        return userData;
    };

    const register = async (name, email, password) => {
        const { data } = await API.post('/auth/register', { name, email, password });
        const userData = data.data;
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken);
        return userData;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, balance, fetchBalance, login, register, logout, loading, isAdmin, updateUser }}>
            {children}
        </AuthContext.Provider>
    );


}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
