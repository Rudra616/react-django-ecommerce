// components/Profile.jsx
import React, { useState, useEffect } from "react";
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt,
    FaSave, FaTimes, FaKey, FaEye, FaEyeSlash
} from "react-icons/fa";
import { getUserProfile, updateUserProfile, changePassword } from "../apis";
import { useAuth } from "../context/AuthContext";

const Profile = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState("profile");
    const [userData, setUserData] = useState({
        username: "",
        email: "",
        phone_number: "",
        date_of_birth: "",
        address: "",
        state: "",
        district: "",
        pin_code: ""
    });
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const { user: authUser, updateUser } = useAuth();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const result = await getUserProfile();
            console.log("Profile API response:", result);

            if (result.success && result.user) {
                setUserData(prev => ({
                    ...prev,
                    username: result.user.username || "",
                    email: result.user.email || "",
                    phone_number: result.user.phone_number || "",
                    date_of_birth: result.user.date_of_birth || "",
                    address: result.user.address || "",
                    state: result.user.state || "",
                    district: result.user.district || "",
                    pin_code: result.user.pin_code || ""
                }));
            } else {
                setMessage(result.error || "Failed to load profile");
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
            setMessage("An error occurred while loading profile");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
        if (message) {
            setMessage("");
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
        if (message) {
            setMessage("");
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setErrors({});
        setMessage("");

        try {
            const result = await updateUserProfile(userData);

            if (result.success) {
                setMessage(result.message || "Profile updated successfully!");
                if (result.data) {
                    updateUser(result.data);
                    setUserData(result.data);
                }
                // Clear errors on success
                setErrors({});
            } else {
                if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
                    setErrors(result.fieldErrors);
                } else if (result.errors && result.errors.length > 0) {
                    setMessage(Array.isArray(result.errors) ? result.errors.join(", ") : result.errors);
                } else {
                    setMessage("Failed to update profile. Please check your input.");
                }
            }
        } catch (error) {
            setMessage("An unexpected error occurred");
            console.error("Profile submit error:", error);
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setChangingPassword(true);
        setErrors({});
        setMessage("");

        try {
            const result = await changePassword(passwordData);

            if (result.success) {
                setMessage("Password changed successfully! A confirmation email has been sent.");
                setPasswordData({
                    current_password: "",
                    new_password: "",
                    confirm_password: ""
                });
                // Clear errors on success
                setErrors({});
            } else {
                if (result.fieldErrors) {
                    setErrors(result.fieldErrors);
                } else {
                    setMessage(Array.isArray(result.error) ? result.error.join(", ") : result.error);
                }
            }
        } catch (error) {
            setMessage("An unexpected error occurred. Please try again.");
            console.error("Password change error:", error);
        } finally {
            setChangingPassword(false);
        }
    };

    // Helper function to display field errors
    const renderFieldError = (fieldName) => {
        if (!errors[fieldName]) return null;

        const error = errors[fieldName];
        if (Array.isArray(error)) {
            return error.map((err, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">{err}</p>
            ));
        }
        return <p className="mt-1 text-sm text-red-600">{error}</p>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-600 hover:text-orange-500 mb-4"
                    >
                        <FaTimes className="mr-2" />
                        Back to Home
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                    <p className="text-gray-600">Manage your profile and security settings</p>
                </div>

                {/* Tabs */}
                <div className="bg-white shadow-sm rounded-lg mb-6">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === "profile"
                                ? "border-orange-500 text-orange-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Profile Information
                        </button>
                        <button
                            onClick={() => setActiveTab("password")}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === "password"
                                ? "border-orange-500 text-orange-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Change Password
                        </button>
                    </nav>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.includes("success") || message.includes("Success")
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                        }`}>
                        {message}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <form onSubmit={handleProfileSubmit} className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Username */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={userData.username}
                                        onChange={handleProfileChange}
                                        className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.username ? "border-red-500" : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                                {renderFieldError("username")}
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleProfileChange}
                                        className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? "border-red-500" : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                                {renderFieldError("email")}
                                <p className="mt-1 text-xs text-gray-500">
                                    Changing your email will require verification
                                </p>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaPhone className="text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={userData.phone_number}
                                        onChange={handleProfileChange}
                                        className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.phone_number ? "border-red-500" : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                                {renderFieldError("phone_number")}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaCalendarAlt className="text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={userData.date_of_birth}
                                        onChange={handleProfileChange}
                                        className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.date_of_birth ? "border-red-500" : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                                {renderFieldError("date_of_birth")}
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="address"
                                        value={userData.address}
                                        onChange={handleProfileChange}
                                        className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.address ? "border-red-500" : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                                {renderFieldError("address")}
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State *
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={userData.state}
                                    onChange={handleProfileChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.state ? "border-red-500" : "border-gray-300"
                                        }`}
                                    required
                                />
                                {renderFieldError("state")}
                            </div>

                            {/* District */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    District *
                                </label>
                                <input
                                    type="text"
                                    name="district"
                                    value={userData.district}
                                    onChange={handleProfileChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.district ? "border-red-500" : "border-gray-300"
                                        }`}
                                    required
                                />
                                {renderFieldError("district")}
                            </div>

                            {/* PIN Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PIN Code *
                                </label>
                                <input
                                    type="text"
                                    name="pin_code"
                                    value={userData.pin_code}
                                    onChange={handleProfileChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.pin_code ? "border-red-500" : "border-gray-300"
                                        }`}
                                    required
                                    maxLength="6"
                                />
                                {renderFieldError("pin_code")}
                                <p className="mt-1 text-xs text-gray-500">6-digit PIN code</p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onBack}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updating}
                                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                            >
                                <FaSave />
                                {updating ? "Updating..." : "Update Profile"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Password Tab */}
                {activeTab === "password" && (
                    <form onSubmit={handlePasswordSubmit} className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6">Change Password</h2>

                        <div className="space-y-4 mb-6">
                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaKey className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        name="current_password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordChange}
                                        className={`pl-10 pr-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.current_password ? "border-red-500" : "border-gray-300"
                                            }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => togglePasswordVisibility("current")}
                                    >
                                        {showPasswords.current ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                                    </button>
                                </div>
                                {renderFieldError("current_password")}
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaKey className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        name="new_password"
                                        value={passwordData.new_password}
                                        onChange={handlePasswordChange}
                                        className={`pl-10 pr-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.new_password ? "border-red-500" : "border-gray-300"
                                            }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => togglePasswordVisibility("new")}
                                    >
                                        {showPasswords.new ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                                    </button>
                                </div>
                                {renderFieldError("new_password")}
                                <p className="mt-1 text-xs text-gray-500">
                                    Password must be at least 8 characters with uppercase, lowercase, number, and special character
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaKey className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        name="confirm_password"
                                        value={passwordData.confirm_password}
                                        onChange={handlePasswordChange}
                                        className={`pl-10 pr-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.confirm_password ? "border-red-500" : "border-gray-300"
                                            }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => togglePasswordVisibility("confirm")}
                                    >
                                        {showPasswords.confirm ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                                    </button>
                                </div>
                                {renderFieldError("confirm_password")}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab("profile")}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Back to Profile
                            </button>
                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                            >
                                <FaKey />
                                {changingPassword ? "Changing..." : "Change Password"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;