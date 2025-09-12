// components/OrderDetails.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { getOrderDetails, updateOrderStatus } from '../apis';

const OrderDetails = ({ orderId, onBack }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const result = await getOrderDetails(orderId);
            if (result.success) {
                setOrder(result.order);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                setOrder(prev => ({ ...prev, status: newStatus }));
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to update order status');
        }
    };

    // Helper function to safely format prices
    const formatPrice = (price) => {
        if (price === null || price === undefined) return '0.00';

        // Convert to number if it's a string
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

        // Check if it's a valid number
        if (isNaN(numericPrice)) return '0.00';

        return numericPrice.toFixed(2);
    };

    // Helper function to calculate item total
    const calculateItemTotal = (item) => {
        const price = item.product?.price || item.price || 0;
        const quantity = item.quantity || 1;

        // Convert to numbers if they're strings
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        const numericQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;

        return (numericPrice * numericQuantity).toFixed(2);
    };

    if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading order details...</div>;
    if (error) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Error: {error}</div>;
    if (!order) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Order not found</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <button onClick={onBack} className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                    ← Back to Orders
                </button>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6">Order #{order.id}</h2>

                    {/* Order Status */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Order Status</h3>
                        <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                            </span>
                            {order.tracking_number && (
                                <span className="text-blue-600">
                                    Tracking: {order.tracking_number}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Shipping Information */}
                    {(order.shipping_address || order.shipping_full_name) && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p><strong>Name:</strong> {order.shipping_address?.full_name || order.shipping_full_name || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {order.shipping_address?.phone_number || order.shipping_phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p><strong>Address:</strong> {order.shipping_address?.address || order.shipping_address || 'N/A'}</p>
                                    <p><strong>District:</strong> {order.shipping_address?.district || order.shipping_district || 'N/A'}</p>
                                    <p><strong>State:</strong> {order.shipping_address?.state || order.shipping_state || 'N/A'}</p>
                                    <p><strong>PIN:</strong> {order.shipping_address?.pin_code || order.shipping_pin_code || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Information */}
                    {(order.payment_method || order.payment_status) && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p><strong>Method:</strong> {order.payment_method ? order.payment_method.toUpperCase() : 'N/A'}</p>
                                    <p><strong>Status:</strong>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(order.payment_status)}`}>
                                            {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'Unknown'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    {order.transaction_id && (
                                        <p><strong>Transaction ID:</strong> {order.transaction_id}</p>
                                    )}
                                    {order.paid_at && (
                                        <p><strong>Paid At:</strong> {new Date(order.paid_at).toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                        {order.items && order.items.length > 0 ? (
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border-b">
                                        <div className="flex items-center space-x-4">
                                            {(item.product?.image || item.product?.image_url) && (
                                                <img
                                                    src={item.product.image || item.product.image_url}
                                                    alt={item.product.name}
                                                    className="w-16 h-16 object-contain bg-white rounded border"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium">{item.product?.name || 'Product'}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                <p className="text-sm text-gray-600">
                                                    Price: ₹{formatPrice(item.product?.price || item.price)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold">
                                            ₹{calculateItemTotal(item)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No items in this order</p>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span>₹{formatPrice(order.total_price)}</span>
                        </div>
                    </div>

                    {/* Order Dates */}
                    <div className="border-t pt-4 mt-4 text-sm text-gray-600">
                        <p>
                            <strong>Order Date:</strong>{" "}
                            {order.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}
                        </p>

                        {order.updated_at && order.updated_at !== order.created_at && (
                            <p>
                                <strong>Last Updated:</strong>{" "}
                                {new Date(order.updated_at).toLocaleString()}
                            </p>
                        )}

                        <p>
                            <strong>Your order will be delivered within a week. For any queries,
                                please email us.</strong>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Helper function for status colors
const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'shipped': return 'bg-indigo-100 text-indigo-800';
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'completed': return 'bg-purple-100 text-purple-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Helper function for payment status colors
const getPaymentStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'failed': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default OrderDetails;