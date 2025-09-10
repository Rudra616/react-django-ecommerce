// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { isTokenValid, clearTokens, getUserProfile, refreshAccessToken } from '../apis';
import axios from 'axios'; // Add this import

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const checkAuthStatus = async () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // If no tokens at all
        if (!accessToken || !refreshToken) {
            setIsLoggedIn(false);
            setUser(null);
            setLoading(false);
            return false;
        }

        // Check if access token is valid
        if (isTokenValid(accessToken)) {
            try {
                const result = await getUserProfile();
                if (result.success) {
                    setUser(result.user);
                    setIsLoggedIn(true);
                } else {
                    // Try to refresh token if profile fetch fails
                    await handleTokenRefresh();
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                await handleTokenRefresh();
            }
        } else {
            // Access token expired, try to refresh
            await handleTokenRefresh();
        }

        setLoading(false);
        return true;
    };

    // Handle token refresh
    const handleTokenRefresh = async () => {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken || !isTokenValid(refreshToken)) {
            logout();
            return false;
        }

        try {
            // Use the refreshAccessToken function from apis.js
            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
                // Get user profile with new token
                const result = await getUserProfile();
                if (result.success) {
                    setUser(result.user);
                    setIsLoggedIn(true);
                    return true;
                }
            } else {
                logout();
                return false;
            }
        } catch (error) {
            console.error("Token refresh failed:", error);
            logout();
            return false;
        }
    };

    useEffect(() => {
        // Check auth status on component mount
        checkAuthStatus();

        // Set up interval to check token validity every 30 seconds
        const interval = setInterval(() => {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && !isTokenValid(accessToken)) {
                handleTokenRefresh();
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const login = (tokens, userData = null) => {
        localStorage.setItem('accessToken', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
        setIsLoggedIn(true);
        if (userData) {
            setUser(userData);
        } else {
            // Fetch user data after login
            checkAuthStatus();
        }
    };

    const logout = () => {
        clearTokens();
        setIsLoggedIn(false);
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            loading,
            user,
            login,
            logout,
            updateUser,
            checkAuthStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};