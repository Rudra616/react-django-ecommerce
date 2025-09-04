// src/components/PrivateRoute.jsx
import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading, checkAuthStatus } = useContext(AuthContext);

    useEffect(() => {
        if (!user && !loading) {
            checkAuthStatus();
        }
    }, [user, loading, checkAuthStatus]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;