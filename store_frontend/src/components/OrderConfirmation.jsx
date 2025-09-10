// components/OrderConfirmation.jsx
import React from "react";

const OrderConfirmation = ({ order, onBack, onViewOrders }) => {
    if (!order) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                    <button
                        onClick={onBack}
                        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    >
                        ← Back to Home
                    </button>
                    <div className="text-center py-12">
                        <p className="text-gray-600">No order information available</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="text-center mb-8">
                    <div className="text-6xl text-green-500 mb-4">✅</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600">Thank you for your purchase</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Order Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Order Information</h3>
                            <p><strong>Order #:</strong> {order.id}</p>
                            <p><strong>Status:</strong> <span className="capitalize">{order.status}</span></p>
                            <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                            <p><strong>Total Amount:</strong> ₹{order.total_price}</p>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Payment Information</h3>
                            <p><strong>Payment Method:</strong> Cash on Delivery</p>
                            <p><strong>Payment Status:</strong> Pending</p>
                        </div>
                    </div>

                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="space-y-3">
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded">
                                <img
                                    src={item.product?.image_url || item.product?.image}
                                    alt={item.product?.name}
                                    className="w-16 h-16 object-contain bg-gray-100 rounded"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{item.product?.name}</p>
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    <p className="text-sm text-gray-600">Price: ₹{item.product?.price}</p>
                                </div>
                                <p className="font-semibold">₹{(item.quantity * item.product?.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-medium text-gray-700 mb-2">Shipping Information</h3>
                    <p><strong>Name:</strong> {order.shipping_full_name || order.user?.username}</p>
                    <p><strong>Phone:</strong> {order.shipping_phone || order.user?.phone_number}</p>
                    <p><strong>Address:</strong> {order.shipping_address || order.user?.address}</p>
                    <p><strong>State:</strong> {order.shipping_state || order.user?.state}</p>
                    <p><strong>District:</strong> {order.shipping_district || order.user?.district}</p>
                    <p><strong>PIN Code:</strong> {order.shipping_pin_code || order.user?.pin_code}</p>
                </div>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Continue Shopping
                    </button>

                    <button
                        onClick={onViewOrders}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        View All Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;