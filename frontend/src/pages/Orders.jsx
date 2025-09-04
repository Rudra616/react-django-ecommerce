// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import { useOrder } from "../context/OrderContext";
import { useNavigate } from "react-router-dom";

const Orders = () => {
    const { orders, fetchOrders, loading, error } = useOrder();
    const navigate = useNavigate();
    const [hasFetched, setHasFetched] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        console.log("🔄 Orders page mounted");
        console.log("🔑 Token exists:", !!token);

        if (!token) {
            console.log("❌ No token, redirecting to login");
            navigate("/login");
            return;
        }

        // Only fetch if we haven't already fetched orders or retrying
        if ((!hasFetched && !loading) || retryCount > 0) {
            console.log("✅ Token found, fetching orders...");
            setHasFetched(true);
            fetchOrders();
        }
    }, [fetchOrders, navigate, hasFetched, loading, retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        navigate("/login");
    };

    // Show loading only if actually loading and no orders
    if (loading && orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Loading your orders...</h2>
                        <p className="text-gray-600 mt-2">Please wait while we fetch your order history.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        console.error("Error details:", error);
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Orders</h2>
                        <p className="text-gray-600 mb-4">
                            {error.message || "There was a problem loading your orders. Your session may have expired."}
                        </p>
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={handleRetry}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={handleLogout}
                                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded transition-colors"
                            >
                                Login Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">📦 My Orders</h1>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>

                    {orders.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">📭</div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
                            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                            <button
                                onClick={() => navigate("/products")}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order, idx) => {
                                const orderedDate = new Date(order.created_at);
                                const deliveryDate = new Date(orderedDate);
                                deliveryDate.setDate(orderedDate.getDate() + 6);

                                return (
                                    <div
                                        key={order.id || idx}
                                        className="border border-gray-200 rounded-lg p-6 bg-white"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="font-semibold text-lg">
                                                    Order #{order.id} —
                                                    <span className={`ml-2 capitalize px-3 py-1 rounded-full text-sm ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </h2>
                                                <p className="text-gray-600 mt-1">
                                                    Ordered on: {orderedDate.toLocaleDateString()} at {orderedDate.toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-800">
                                                    ${order.total_price}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Delivery by: {deliveryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4 mt-4">
                                            <h3 className="font-medium text-gray-700 mb-3">Order Items</h3>
                                            {order.items && order.items.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="bg-gray-50">
                                                                <th className="p-3 text-left text-sm font-medium text-gray-700">Product</th>
                                                                <th className="p-3 text-center text-sm font-medium text-gray-700">Price</th>
                                                                <th className="p-3 text-center text-sm font-medium text-gray-700">Qty</th>
                                                                <th className="p-3 text-center text-sm font-medium text-gray-700">Subtotal</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.items.map((item, i) => (
                                                                <tr key={i} className="border-b border-gray-100">
                                                                    <td className="p-3">
                                                                        <div className="flex items-center">
                                                                            <img
                                                                                src={item.product_image || "https://via.placeholder.com/50x50"}
                                                                                alt={item.product_name || item.product?.name}
                                                                                className="w-12 h-12 object-cover rounded mr-3"
                                                                                onError={(e) => {
                                                                                    e.target.src = "https://via.placeholder.com/50x50";
                                                                                }}
                                                                            />
                                                                            <div>
                                                                                <p className="font-medium text-gray-800">
                                                                                    {item.product_name || item.product?.name}
                                                                                </p>
                                                                                {item.product?.description && (
                                                                                    <p className="text-sm text-gray-500 truncate max-w-xs">
                                                                                        {item.product.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3 text-center text-gray-700">
                                                                        ${item.product_price || item.product?.price}
                                                                    </td>
                                                                    <td className="p-3 text-center text-gray-700">
                                                                        {item.quantity}
                                                                    </td>
                                                                    <td className="p-3 text-center font-medium text-gray-800">
                                                                        $
                                                                        {(
                                                                            (item.product_price || item.product?.price || 0) * item.quantity
                                                                        ).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">
                                                    No items found for this order.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;