// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const {
    cartItems,
    updateItemQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
    loading,
    error,
    fetchCart
  } = useCart();
  useEffect(() => {
    console.log('🛒 Cart items:', cartItems);
    console.log('📦 First item structure:', cartItems[0]);
  }, [cartItems]);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Ensure cartItems is always treated as an array
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const safeCartCount = getCartCount();

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading your cart...</h1>
            <p className="text-gray-600">Please wait while we fetch your cart items.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Cart</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchCart}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart if user is logged in but cart is empty
  if (safeCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show cart with items
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart ({safeCartCount} items)</h1>
          <button
            onClick={fetchCart}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Refresh Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
// In Cart.jsx - Update the product display logic
              {safeCartItems.map((item) => {
                // Handle different product data structures
                const productName = item.product?.name || `Product #${item.product_id}` || 'Unknown Product';
                const productPrice = item.product?.price || item.price || 0;
                const productImage = item.product?.image || "https://via.placeholder.com/80x80";
                const productDescription = item.product?.description || '';

                return (
                  <div key={item.id} className="flex items-center p-6 border-b">
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-20 h-20 object-cover rounded mr-6"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x80";
                      }}
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{productName}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">{productDescription}</p>
                      <p className="text-lg font-bold text-blue-600">₹{productPrice}</p>
                    </div>

                    <div className="flex items-center space-x-2 mr-6">
                      <button
                        onClick={() => updateItemQuantity(item.id, (item.quantity || 1) - 1)}
                        disabled={(item.quantity || 1) <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity || 1}</span>
                      <button
                        onClick={() => updateItemQuantity(item.id, (item.quantity || 1) + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800 mb-2">
                        ₹{(productPrice * (item.quantity || 1)).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">₹0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">₹{(getCartTotal() * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span>₹{(getCartTotal() * 1.08).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="w-full text-center block border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;