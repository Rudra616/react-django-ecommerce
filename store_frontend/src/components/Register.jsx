// components/Register.jsx
import React, { useState } from "react";
import { registerUser } from "../apis";
import { useAuth } from "../context/AuthContext";

const Register = ({ setSection, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        phone_number: "",
        date_of_birth: "",
        address: "",
        state: "",
        district: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        setSuccessMessage("");

        try {
            const result = await registerUser(formData);

            if (result.success) {
                setSuccessMessage(result.message);
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    confirm_password: "",
                    phone_number: "",
                    date_of_birth: "",
                    address: "",
                    state: "",
                    district: ""
                });
            } else {
                if (result.fieldErrors) {
                    setErrors(result.fieldErrors);
                } else if (result.errors) {
                    setErrors({ non_field_errors: result.errors });
                }
            }
        } catch (error) {
            setErrors({ non_field_errors: ["An unexpected error occurred. Please try again."] });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join our community and start shopping today
                    </p>
                </div>

                {successMessage && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                        <div className="flex">
                            <div className="py-1">
                                <svg className="h-6 w-6 text-blue-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold">Registration Successful!</p>
                                <p>{successMessage}</p>
                                <p className="text-sm mt-1">
                                    Please check your email (including spam folder) for the verification link.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {errors.non_field_errors && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {errors.non_field_errors.map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username *
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.username ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                                placeholder="Enter username (4-20 characters)"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password *
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                                placeholder="Enter password (min 8 characters)"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                                Confirm Password *
                            </label>
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type="password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                                placeholder="Confirm your password"
                            />
                            {errors.confirm_password && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                Phone Number *
                            </label>
                            <input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.phone_number ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                                placeholder="Enter 10-digit phone number"
                            />
                            {errors.phone_number && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                                Date of Birth *
                            </label>
                            <input
                                id="date_of_birth"
                                name="date_of_birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.date_of_birth ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                            />
                            {errors.date_of_birth && (
                                <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Address *
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.address ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                                placeholder="Enter your complete address"
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                    State *
                                </label>
                                <input
                                    id="state"
                                    name="state"
                                    type="text"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.state ? 'border-red-300' : 'border-gray-300'
                                        } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                                    placeholder="State"
                                />
                                {errors.state && (
                                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                                    District *
                                </label>
                                <input
                                    id="district"
                                    name="district"
                                    type="text"
                                    value={formData.district}
                                    onChange={handleChange}
                                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.district ? 'border-red-300' : 'border-gray-300'
                                        } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                                    placeholder="District"
                                />
                                {errors.district && (
                                    <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="font-medium text-orange-600 hover:text-orange-500"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;