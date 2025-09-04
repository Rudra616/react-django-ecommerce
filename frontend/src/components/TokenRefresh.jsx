// src/components/TokenRefresh.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TokenRefresh = () => {
    const { refreshToken, isTokenValid } = useAuth();

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // When user comes back to the tab, check token validity
                if (!isTokenValid) {
                    refreshToken().catch(error => {
                        console.error('Background token refresh failed:', error);
                    });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isTokenValid, refreshToken]);

    return null; // This component doesn't render anything
};

export default TokenRefresh;