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

    if (loading) return <div>Loading order details...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!order) return <div>Order not found</div>;

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
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </span>
                            {order.tracking_number && (
                                <span className="text-blue-600">
                                    Tracking: {order.tracking_number}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Shipping Information */}
                    {order.shipping_address && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p><strong>Name:</strong> {order.shipping_address.full_name}</p>
                                    <p><strong>Phone:</strong> {order.shipping_address.phone_number}</p>
                                </div>
                                <div>
                                    <p><strong>Address:</strong> {order.shipping_address.address}</p>
                                    <p><strong>District:</strong> {order.shipping_address.district}</p>
                                    <p><strong>State:</strong> {order.shipping_address.state}</p>
                                    <p><strong>PIN:</strong> {order.shipping_address.pin_code}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Updates */}
                    {order.shipping_updates && order.shipping_updates.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Shipping Updates</h3>
                            <div className="space-y-2">
                                {order.shipping_updates.map((update, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <div>
                                            <p className="font-medium">{update.status}</p>
                                            <p className="text-sm text-gray-600">{update.timestamp}</p>
                                            {update.location && (
                                                <p className="text-sm text-gray-600">Location: {update.location}</p>
                                            )}
                                            {update.notes && (
                                                <p className="text-sm text-gray-600">Notes: {update.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                        {order.items && order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border-b">
                                <div className="flex items-center space-x-4">
                                    {item.product?.images?.[0] && (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">{item.product?.name}</p>
                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-semibold">₹{(item.product?.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span>₹{order.total_price?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function for status colors
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

export default OrderDetails;