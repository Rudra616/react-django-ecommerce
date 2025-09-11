// components/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { resetPassword } from "../apis";

const ResetPassword = ({ uid, token, setSection }) => {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validLink, setValidLink] = useState(true);

    // Check if we have valid uid and token
    useEffect(() => {
        if (!uid || !token) {
            setValidLink(false);
            setError("Invalid or expired reset link");
        }
    }, [uid, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!formData.password || !formData.confirmPassword) {
            setError("Both fields are required");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const result = await resetPassword(uid, token, formData.password);

            if (result.success) {
                setMessage(result.message || "Password reset successfully! Redirecting to login...");

                setTimeout(() => {
                    // Clean up URL
                    window.history.replaceState({}, document.title, "/");
                    // Redirect to login
                    setSection("login");
                }, 3000);
            } else {
                setError(result.error || "Failed to reset password. The link may have expired.");
            }
        } catch (err) {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!validLink) {
        return (
            <div className="flex justify-center px-4 py-16">
                <div className="w-full max-w-[700px] bg-white rounded-2xl shadow-2xl p-10 border border-gray-200 text-center">
                    <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                        Invalid Reset Link
                    </h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <button
                        onClick={() => setSection("login")}
                        className="bg-orange-500 text-white font-semibold rounded-full py-3 px-6 hover:bg-orange-600 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center px-4 py-16">
            <div className="w-full max-w-[700px] bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Reset Password
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter new password (min 8 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            className="border border-gray-300 p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                            required
                            minLength="8"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="border border-gray-300 p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                            required
                            minLength="8"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-orange-500 text-white font-semibold rounded-full py-3 hover:bg-orange-600 transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? "Resetting Password..." : "Reset Password"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setSection("login")}
                        className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;