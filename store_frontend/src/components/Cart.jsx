// Update Cart.jsx to work without payment method selection
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Checkout from "./Checkout";

const Cart = ({ items, onBack, onUpdateCart, onRemoveFromCart, onOrderCreated }) => {
    const [updatingItems, setUpdatingItems] = useState({});
    const [checkoutError, setCheckoutError] = useState("");
    const { isLoggedIn } = useAuth();
    const [showCheckout, setShowCheckout] = useState(false);

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= 5) {
            setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
            try {
                await onUpdateCart(itemId, newQuantity);
            } catch (error) {
                console.error("Failed to update quantity:", error);
            }
            setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleRemove = async (itemId) => {
        setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
        try {
            await onRemoveFromCart(itemId);
        } catch (error) {
            console.error("Failed to remove item:", error);
        }
        setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    };

    const handleProceedToCheckout = () => {
        if (!isLoggedIn) {
            setCheckoutError("Please login to proceed with checkout");
            return;
        }
        setShowCheckout(true);
    };

    const handleOrderCreated = (orderData) => {
        setShowCheckout(false);
        onOrderCreated(orderData);
    };

    if (showCheckout) {
        return (
            <Checkout
                cartItems={items}
                onOrderCreated={handleOrderCreated}
                onBack={() => setShowCheckout(false)}
            />
        );
    }

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (Number(item.product?.price || 0) * item.quantity), 0);
        const total = subtotal; // Removed shipping and tax for simplicity

        return { subtotal, total };
    };

    const { subtotal, total } = calculateTotals();

    if (!items || items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                    <button
                        onClick={onBack}
                        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm sm:text-base"
                    >
                        ← Back to Home
                    </button>
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
                        <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
                        <button
                            onClick={onBack}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm sm:text-base"
                        >
                            Start Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                <button
                    onClick={onBack}
                    className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm sm:text-base"
                >
                    ← Back to Home
                </button>

                <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
                    Your Cart ({items.length} item{items.length !== 1 ? 's' : ''})
                </h2>

                {checkoutError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {checkoutError}
                        {checkoutError.includes("login") && (
                            <button
                                onClick={() => window.location.href = "/login"}
                                className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm"
                            >
                                Login
                            </button>
                        )}
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Cart Items */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                        {/* Product Image */}
                                        <img
                                            src={item.product?.image_url || item.product?.image}
                                            alt={item.product?.name}
                                            className="w-30 h-30 sm:w-40 sm:h-30 object-contain rounded-lg bg-gray-100 p-2 mx-auto sm:mx-0"
                                        />
                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0 text-center sm:text-left">
                                            <h3 className="font-semibold text-base sm:text-lg truncate">
                                                {item.product?.name}
                                            </h3>
                                            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 hidden sm:block">
                                                {item.product?.description}
                                            </p>
                                            <p className="text-lg font-bold text-orange-600 mt-1">
                                                ₹{item.product?.price}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6">
                                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1 || updatingItems[item.id]}
                                                        className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition text-sm"
                                                    >
                                                        -
                                                    </button>

                                                    <span className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center font-semibold text-sm">
                                                        {updatingItems[item.id] ? "..." : item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        disabled={item.quantity >= 5 || updatingItems[item.id]}
                                                        className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition text-sm"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    disabled={updatingItems[item.id]}
                                                    className="text-red-500 text-xs sm:text-sm hover:text-red-700 disabled:opacity-50 transition px-2 py-1"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            {/* Item Total */}
                                            <div className="text-right min-w-16">
                                                <p className="font-semibold text-base sm:text-lg">
                                                    ₹{(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-4">
                            <h3 className="text-lg sm:text-xl font-bold mb-4">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm sm:text-base">
                                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-bold text-base sm:text-lg">
                                        <span>Total</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleProceedToCheckout}
                                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition font-semibold text-sm sm:text-base"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;