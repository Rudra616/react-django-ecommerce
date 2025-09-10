// components/OrdersPage.jsx - UPDATED to handle empty data
import React, { useState, useEffect } from "react";
import { getOrders } from "../apis";
import { useAuth } from "../context/AuthContext";

const OrdersPage = ({ onBack, onViewOrderDetail }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { isLoggedIn } = useAuth();

    const debugOrders = async () => {
        console.log("=== DEBUG ORDERS ===");
        console.log("User logged in:", isLoggedIn);

        const result = await getOrders();
        console.log("Raw API result:", result);

        if (result.success) {
            console.log("Orders data structure:", result.orders);
            result.orders.forEach((order, index) => {
                console.log(`Order ${index}:`, {
                    id: order.id,
                    status: order.status,
                    total_price: order.total_price,
                    items_count: order.items ? order.items.length : 0,
                    items_structure: order.items ? order.items[0] : 'no items'
                });
            });
        }
    };


    useEffect(() => {
        const fetchOrders = async () => {
            if (!isLoggedIn) {
                setError("Please login to view your orders");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const result = await getOrders();
                console.log("Orders fetch result:", result);

                if (result.success) {
                    setOrders(result.orders);
                } else {
                    setError(result.error || "Failed to load orders");
                }
            } catch (err) {
                console.error("Orders fetch error:", err);
                setError("Network error loading orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isLoggedIn]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-purple-100 text-purple-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ... rest of the component remains the same until the return statement

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                <button
                    onClick={onBack}
                    className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                    ← Back to Home
                </button>
                <button
                    onClick={debugOrders}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                    Debug Orders
                </button>

                <h2 className="text-2xl sm:text-3xl font-bold mb-6">My Orders</h2>

                {!orders || orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {loading ? 'Loading...' : 'No Orders Yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {loading ? 'Loading your orders...' : 'You haven\'t placed any orders yet.'}
                        </p>
                        {!loading && (
                            <button
                                onClick={onBack}
                                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                Start Shopping
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                                        <p className="text-gray-600 text-sm">
                                            Placed on {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                                        </span>
                                        <span className="text-lg font-bold text-orange-600">
                                            ₹{order.total_price || '0.00'}
                                        </span>
                                    </div>
                                </div>

                                {order.items && order.items.length > 0 ? (
                                    <>
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold mb-2">Items:</h4>
                                            <div className="space-y-2">
                                                {order.items.slice(0, 3).map((item) => (
                                                    <div key={item.id} className="flex items-center gap-3">
                                                        {item.product?.image_url && (
                                                            <img
                                                                src={item.product.image_url}
                                                                alt={item.product.name}
                                                                className="w-12 h-12 object-contain bg-gray-100 rounded"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{item.product?.name || 'Unknown Product'}</p>
                                                            <p className="text-xs text-gray-600">
                                                                {item.quantity} × ₹{item.product?.price || item.price || '0.00'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <p className="text-sm text-gray-600">
                                                        + {order.items.length - 3} more items
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t pt-4 mt-4">
                                            <button
                                                onClick={() => onViewOrderDetail(order.id)}
                                                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                                            >
                                                View Order Details →
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="border-t pt-4">
                                        <p className="text-gray-600">No items in this order</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;