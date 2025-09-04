// src/pages/Profile.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        date_of_birth: user?.date_of_birth || '',
        address: user?.address || '',
        state: user?.state || '',
        district: user?.district || ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle profile update here
        console.log('Profile updated:', formData);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

                <div className="bg-white rounded-lg shadow-md">
                    {/* Tabs */}
                    <div className="border-b">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-6 font-medium ${activeTab === 'profile'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`py-4 px-6 font-medium ${activeTab === 'orders'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Order History
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`py-4 px-6 font-medium ${activeTab === 'security'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Security
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            District
                                        </label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                                >
                                    Update Profile
                                </button>
                            </form>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-6">Order History</h3>
                                <div className="bg-gray-50 rounded-lg p-6 text-center">
                                    <div className="text-6xl mb-4">📦</div>
                                    <p className="text-gray-600">You haven't placed any orders yet.</p>
                                    <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                        Start Shopping
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-3">Change Password</h4>
                                        <div className="space-y-4">
                                            <input
                                                type="password"
                                                placeholder="Current Password"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            />
                                            <input
                                                type="password"
                                                placeholder="New Password"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            />
                                            <input
                                                type="password"
                                                placeholder="Confirm New Password"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            />
                                            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                                Update Password
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-3">Two-Factor Authentication</h4>
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-600">2FA is currently disabled</p>
                                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                                                Enable 2FA
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;