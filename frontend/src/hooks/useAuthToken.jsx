// src/hooks/useAuthToken.js
import { useState, useEffect, useCallback } from 'react';

export const useAuthToken = () => {
    const [isTokenValid, setIsTokenValid] = useState(true);

    const checkTokenExpiration = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsTokenValid(false);
            return false;
        }

        try {
            // Decode JWT token to check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            const isValid = currentTime < expirationTime;
            setIsTokenValid(isValid);

            // If token expires in less than 5 minutes, consider refreshing
            if (currentTime > expirationTime - 5 * 60 * 1000) {
                console.log('🔄 Token expiring soon, should refresh');
            }

            return isValid;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            setIsTokenValid(false);
            return false;
        }
    }, []);

    const refreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/"}auth/jwt/refresh/`,
                { refresh: refreshToken }
            );

            const newAccessToken = response.data.access;
            localStorage.setItem('accessToken', newAccessToken);
            setIsTokenValid(true);

            return newAccessToken;
        } catch (error) {
            console.error('Token refresh failed:', error);
            // Clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            setIsTokenValid(false);

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }

            throw error;
        }
    };

    useEffect(() => {
        // Check token validity on mount
        checkTokenExpiration();

        // Set up periodic token check (every minute)
        const interval = setInterval(checkTokenExpiration, 60 * 1000);

        return () => clearInterval(interval);
    }, [checkTokenExpiration]);

    return {
        isTokenValid,
        checkTokenExpiration,
        refreshToken
    };
};