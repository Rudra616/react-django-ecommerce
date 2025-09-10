// components/SessionExpiredModal.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const SessionExpiredModal = () => {
    const { showSessionExpired, dismissSessionExpired } = useAuth();

    if (!showSessionExpired) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-red-600 mb-4">Session Expired</h2>
                <p className="text-gray-700 mb-6">
                    Your session has expired. Please log in again to continue.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={dismissSessionExpired}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={() => window.location.href = "/login"}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal;