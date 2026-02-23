import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api/v1',
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh on 401
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const { data } = await axios.post(
                        `${process.env.REACT_APP_API_URL || '/api/v1'}/auth/refresh`,
                        { refreshToken }
                    );
                    localStorage.setItem('accessToken', data.data.accessToken);
                    localStorage.setItem('refreshToken', data.data.refreshToken);
                    originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                    return API(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
