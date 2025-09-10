// components/OrderDetailPage.jsx
import React, { useState, useEffect } from "react";
import { getOrderDetail, getPaymentDetails } from "../apis";

const OrderDetailPage = ({ orderId, onBack }) => {
    const [order, setOrder] = useState(null);
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!orderId) {
            setError("Invalid order ID");
            setLoading(false);
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const [orderResult, paymentResult] = await Promise.all([
                    getOrderDetail(orderId),
                    getPaymentDetails(orderId)
                ]);

                if (orderResult.success) {
                    setOrder(orderResult.order);
                } else {
                    setError(orderResult.error || "Failed to load order details");
                }

                if (paymentResult.success) {
                    setPayment(paymentResult.payment);
                }
            } catch (err) {
                setError("Network error loading order details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);
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
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                    <button
                        onClick={onBack}
                        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    >
                        ← Back to Orders
                    </button>
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                    <button
                        onClick={onBack}
                        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    >
                        ← Back to Orders
                    </button>
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                    <button
                        onClick={onBack}
                        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    >
                        ← Back to Orders
                    </button>
                    <div className="text-center py-12">
                        <p className="text-gray-600">Order not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <button
                    onClick={onBack}
                    className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                    ← Back to Orders
                </button>

                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
                            <p className="text-gray-600">
                                Placed on {formatDate(order.created_at)}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 sm:mt-0">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t pt-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                    <img
                                        src={item.product?.image_url || item.product?.image}
                                        alt={item.product?.name}
                                        className="w-16 h-16 object-contain bg-gray-100 rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.product?.name}</h3>
                                        <p className="text-gray-600 text-sm">
                                            Quantity: {item.quantity}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            Price: ₹{item.product?.price || item.price}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            ₹{(item.quantity * (item.product?.price || item.price)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium mb-2">Shipping Address</h3>
                                <p className="text-gray-600">
                                    {order.shipping_full_name || order.user?.username}<br />
                                    {order.shipping_phone || order.user?.phone_number}<br />
                                    {order.shipping_address || order.user?.address}<br />
                                    {order.shipping_district || order.user?.district},
                                    {order.shipping_state || order.user?.state} -
                                    {order.shipping_pin_code || order.user?.pin_code}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Payment Information</h3>
                                {payment ? (
                                    <div className="text-gray-600">
                                        <p>Method: {payment.payment_method}</p>
                                        <p>Status: {payment.status}</p>
                                        <p>Amount: ₹{payment.amount}</p>
                                        {payment.paid_at && (
                                            <p>Paid on: {formatDate(payment.paid_at)}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-600">Payment information not available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Total Amount</span>
                            <span className="text-2xl font-bold text-orange-600">
                                ₹{order.total_price}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;