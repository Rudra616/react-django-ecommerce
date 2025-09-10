import React, { useState } from "react";
import { loginUser, forgetpassword } from "../apis";
import { useAuth } from "../context/AuthContext";

const Login = ({ setSection }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    // Forgot Password states
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [resetError, setResetError] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    // Handle Login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError("");
        setLoading(true);

        if (!username || !password) {
            setErrors({
                username: !username ? "Username is required" : "",
                password: !password ? "Password is required" : "",
            });
            setLoading(false);
            return;
        }

        try {
            const result = await loginUser({ username, password });
            const data = result?.data || result;

            if (data.access) {
                login({ access: data.access, refresh: data.refresh });
                setSection("home");
            } else {
                const fieldErrors = {};
                let generalMsg = "";
                Object.keys(data).forEach((key) => {
                    if (key === "non_field_errors") {
                        generalMsg = Array.isArray(data[key]) ? data[key].join(" ") : data[key];
                    } else {
                        fieldErrors[key] = Array.isArray(data[key]) ? data[key].join(" ") : data[key];
                    }
                });
                setErrors(fieldErrors);
                setGeneralError(generalMsg || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setGeneralError("Something went wrong. Please try again.");
        }

        setLoading(false);
    };

    // Handle Forgot Password
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setResetError("");
        setResetMessage("");
        setResetLoading(true);

        if (!resetEmail) {
            setResetError("Email is required");
            setResetLoading(false);
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(resetEmail)) {
            setResetError("Please enter a valid email address");
            setResetLoading(false);
            return;
        }

        try {
            const result = await forgetpassword(resetEmail);
            if (result.success) {
                setResetMessage(result.message || "Password reset link has been sent to your email");
                setResetEmail("");
                // Auto-hide after success
                setTimeout(() => {
                    setShowForgotPassword(false);
                    setResetMessage("");
                }, 5000);
            } else {
                setResetError(result.error || "Failed to send reset link. Please try again.");
            }
        } catch (err) {
            setResetError("Network error. Please check your connection and try again.");
        }

        setResetLoading(false);
    };

    // Handle direct navigation to reset password (if user has a link)

    return (
        <div className="flex justify-center px-4">
            <div className="w-full max-w-[1400px] flex justify-center py-16">
                <div className="w-full max-w-[700px] bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">

                    {/* Toggle between Login and Forgot Password */}
                    {!showForgotPassword ? (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">
                                Login
                            </h2>

                            {/* Username */}
                            <div className="flex flex-col">
                                <input
                                    type="text"
                                    placeholder="Username or Email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="border border-gray-300 p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg transition-all duration-200"
                                />
                                {errors.username && (
                                    <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="flex flex-col">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border border-gray-300 p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg transition-all duration-200"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Forgot Password Links */}
                            <div className="flex flex-col gap-2">
                                <p
                                    className="text-sm text-orange-500 cursor-pointer hover:underline text-right"
                                    onClick={() => setShowForgotPassword(true)}
                                >
                                    Forgot Password?
                                </p>

                                {/* Direct reset password link for users who already have a reset link */}

                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-orange-500 text-white font-semibold rounded-full py-3 w-full hover:bg-orange-600 transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>

                            {/* General API Errors */}
                            {generalError && (
                                <p className="text-red-500 text-sm mt-2 text-center font-medium">
                                    {generalError}
                                </p>
                            )}

                            {/* Register Link */}
                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setSection("register")}
                                        className="font-medium text-orange-600 hover:text-orange-500"
                                    >
                                        Register here
                                    </button>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="flex flex-col gap-6">
                            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                                Reset Password
                            </h2>

                            <p className="text-gray-600 text-center mb-4">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            <div className="flex flex-col">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="border border-gray-300 p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg transition-all duration-200"
                                />
                                {resetError && (
                                    <p className="text-red-500 text-sm mt-1">{resetError}</p>
                                )}
                                {resetMessage && (
                                    <p className="text-green-600 text-sm mt-1">{resetMessage}</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className={`bg-blue-500 text-white font-semibold rounded-full py-3 flex-1 hover:bg-blue-600 transition-colors duration-200 ${resetLoading ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    {resetLoading ? "Sending..." : "Send Reset Link"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(false)}
                                    className="bg-gray-300 text-gray-700 font-semibold rounded-full py-3 flex-1 hover:bg-gray-400 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;