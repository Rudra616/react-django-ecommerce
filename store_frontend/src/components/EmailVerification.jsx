// components/EmailVerification.jsx
import React, { useState, useEffect } from "react";
import { verifyEmail } from "../apis";

const EmailVerification = ({ uidb64, token, setSection }) => {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verify = async () => {
            try {
                const result = await verifyEmail(uidb64, token);

                if (result.success) {
                    setMessage(result.message);
                    // Redirect to login after 3 seconds
                    setTimeout(() => setSection("login"), 3000);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError("An error occurred during verification");
                console.error("Verification error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (uidb64 && token) {
            verify();
        } else {
            setError("Invalid verification link");
            setLoading(false);
        }
    }, [uidb64, token, setSection]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying your email...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
                {message ? (
                    <div className="text-center">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-green-700 mb-4">Success!</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to login page...</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-red-700 mb-4">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => setSection("login")}
                            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailVerification;