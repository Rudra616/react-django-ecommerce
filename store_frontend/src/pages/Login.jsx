import React, { useState } from "react";
import { loginUser } from "../apis";

const Login = ({ setSection }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => { // <-- function name fixed
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

            // Check if API returned nested data
            const data = result?.data || result;

            if (data.access) {
                localStorage.setItem("accessToken", data.access);
                localStorage.setItem("refreshToken", data.refresh);
                setSection("home"); // Switch to home without reload
            } else {
                // Handle API field errors
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

    return (
        <div className="flex justify-center px-4">
            <div className="w-full max-w-[1400px] flex justify-center py-16">
                <div className="w-full max-w-[700px] bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6"> {/* fixed */}
                        <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">
                            Login
                        </h2>

                        {/* Username */}
                        <div className="flex flex-col">
                            <input
                                type="text"
                                placeholder="Username"
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
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
