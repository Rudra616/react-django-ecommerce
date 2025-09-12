// components/OrderConfirmation.jsx - COMPLETELY UPDATED
import React from "react";

const OrderConfirmation = ({ order, onBack, onViewOrders }) => {
    if (!order) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                    <button onClick={onBack} className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                        ← Back to Home
                    </button>
                    <div className="text-center py-12">
                        <p className="text-gray-600">No order information available</p>
                    </div>
                </div>
            </div>
        );
    }

    // Debug: Log the order data to see what we're working with
    console.log("Order data in confirmation:", order);

    const formatDate = (dateString) => {
        if (!dateString) return 'Just now';
        try {
            // Handle different date formats
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Today';
            }
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Today';
        }
    };

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

    // Calculate total from items if total_price is missing
    const calculateTotal = () => {
        if (order.total_price && order.total_price !== '0.00') {
            return order.total_price;
        }

        if (order.items && order.items.length > 0) {
            return order.items.reduce((sum, item) => {
                const price = item.product?.price || item.price || 0;
                const quantity = item.quantity || 1;
                return sum + (price * quantity);
            }, 0).toFixed(2);
        }

        return '0.00';
    };

    const totalAmount = calculateTotal();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <button onClick={onBack} className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                    ← Back to Home
                </button>

                <div className="text-center mb-8">
                    <div className="text-6xl text-green-500 mb-4">✅</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600">Thank you for your purchase. Your payment was successful.</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Order Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Order Information</h3>
                            <p><strong>Order #:</strong> {order.id || 'N/A'}</p>
                            <p>
                                <strong>Status:</strong>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing'}
                                </span>
                            </p>
                            <p><strong>Order Date:</strong> {formatDate(order.created_at)}</p>
                            <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Payment Information</h3>
                            <p><strong>Payment Method:</strong> {order.payment_method || 'Credit/Debit Card'}</p>
                            <p>
                                <strong>Payment Status:</strong>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${order.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'Processing'}
                                </span>
                            </p>
                            {order.transaction_id && (
                                <p><strong>Transaction ID:</strong> {order.transaction_id}</p>
                            )}
                        </div>
                    </div>

                    {/* Shipping Information */}
                    {(order.shipping_address || order.shipping_full_name) && (
                        <div className="border-t pt-6 mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Shipping Information</h3>
                            <p><strong>Name:</strong> {order.shipping_address?.full_name || order.shipping_full_name || 'N/A'}</p>
                            <p><strong>Phone:</strong> {order.shipping_address?.phone_number || order.shipping_phone || 'N/A'}</p>
                            <p><strong>Address:</strong> {order.shipping_address?.address || order.shipping_address || 'N/A'}</p>
                            <p><strong>District:</strong> {order.shipping_address?.district || order.shipping_district || 'N/A'}</p>
                            <p><strong>State:</strong> {order.shipping_address?.state || order.shipping_state || 'N/A'}</p>
                            <p><strong>PIN Code:</strong> {order.shipping_address?.pin_code || order.shipping_pin_code || 'N/A'}</p>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="border-t pt-6">
                        <h3 className="font-medium text-gray-700 mb-4">Order Items</h3>
                        {order.items && order.items.length > 0 ? (
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                                                    Price: ₹{item.product?.price || item.price || '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold">
                                            ₹{((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No items in this order</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Continue Shopping
                    </button>

                    <button
                        onClick={onViewOrders}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        View All Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;