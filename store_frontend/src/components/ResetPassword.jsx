// components/ResetPassword.jsx
import React, { useState } from "react";
import { resetPassword } from "../apis";
import { useNavigate } from "react-router-dom";

const ResetPassword = ({ uid, token, setSection }) => {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!formData.password || !formData.confirmPassword) {
            setError("Both fields are required");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        // Use the API function instead of direct fetch
        const result = await resetPassword(uid, token, formData.password);

        if (result.success) {
            setMessage(result.message);

            setTimeout(() => {
                // 👇 reset URL to home/root (no extra path)
                window.history.pushState({}, "", "/");

                // 👇 switch SPA section
                setSection("login");
            }, 2000);
        } else {
            setError(result.error);
        }


        setLoading(false);
    };

    return (
        <div className="flex justify-center px-4">
            <div className="w-full max-w-[700px] bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Reset Password
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <input
                        type="password"
                        name="password"
                        placeholder="New Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="border border-gray-300 p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="border border-gray-300 p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {message && <p className="text-green-600 text-sm">{message}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-orange-500 text-white font-semibold rounded-full py-3 hover:bg-green-600 transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;