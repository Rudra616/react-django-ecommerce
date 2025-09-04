// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        paymentMethod: 'credit-card'
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate payment processing
        setTimeout(() => {
            clearCart();
            setLoading(false);
            navigate('/payment-success');
        }, 2000);
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Checkout</h1>
                        <p className="text-gray-600 mb-6">Your cart is empty.</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Checkout Form */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Shipping Information</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        required
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        required
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Payment Method
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="credit-card"
                                            checked={formData.paymentMethod === 'credit-card'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                        />
                                        Credit Card
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="paypal"
                                            checked={formData.paymentMethod === 'paypal'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                        />
                                        PayPal
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                        />
                                        Cash on Delivery
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Processing...' : `Pay $${getCartTotal().toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>

                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-16 h-16 object-cover rounded mr-4"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-800">{item.product.name}</h3>
                                            <p className="text-gray-600">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-gray-800">
                                        ${(item.product.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-semibold">$0.00</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-semibold">${(getCartTotal() * 0.08).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold pt-4 border-t">
                                <span>Total</span>
                                <span>${(getCartTotal() * 1.08).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;