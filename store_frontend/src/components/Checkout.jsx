// components/Checkout.jsx - UPDATED
import React, { useState } from 'react';
import { createOrder, createPayment, getOrderDetails } from '../apis';
import ShippingAddressForm from './ShippingAddressForm';
import PaymentMethodSelector from './PaymentMethodSelector';
import StripePaymentForm from './StripePaymentForm';
import { useAuth } from '../context/AuthContext';

const Checkout = ({ cartItems, onOrderCreated, onBack }) => {
    const [step, setStep] = useState('address');
    const [shippingAddress, setShippingAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const handleAddressSubmit = (address) => {
        setShippingAddress(address);
        setStep('payment');
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };

    // Checkout.jsx - Update handleOrderCreation
    // Checkout.jsx - Update handleOrderCreation
    const handleOrderCreation = async (orderItems, paymentData = null) => {
        setLoading(true);
        setError('');

        try {
            console.log("Creating order with items:", orderItems);

            // Include payment method in order creation
            const orderResult = await createOrder({
                items: orderItems,
                payment_method: paymentMethod
            });

            if (!orderResult.success) {
                throw new Error(orderResult.error || 'Failed to create order');
            }

            const orderId = orderResult.orderId;
            console.log("Order created with ID:", orderId);

            // For COD orders, payment is already created on the backend
            // Just fetch the order details
            if (paymentMethod === 'cod') {
                // Fetch the complete order details
                const orderDetails = await getOrderDetails(orderId);
                if (orderDetails.success) {
                    onOrderCreated(orderDetails.order);
                } else {
                    // Fallback order data
                    onOrderCreated({
                        id: orderId,
                        status: 'processing',
                        payment_method: 'cod',
                        payment_status: 'pending',
                        total_price: total,
                        items: cartItems,
                        shipping_address: shippingAddress
                    });
                }
                return;
            }

            // For card payments, handle payment creation
            if (paymentMethod === 'card') {
                const paymentResult = await createPayment(orderId, 'card');
                if (!paymentResult.success) {
                    throw new Error(paymentResult.error || 'Failed to create payment');
                }

                return {
                    orderId,
                    paymentData: paymentResult.data
                };
            }

        } catch (err) {
            setError(err.message);
            console.error("Order creation error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // const handleCODPayment = async () => {
    //     try {
    //         const orderItems = cartItems.map(item => ({
    //             product: item.product.id,
    //             quantity: item.quantity
    //         }));

    //         await handleOrderCreation(orderItems);
    //     } catch (err) {
    //         setError(err.message);
    //     }
    // };

    const handleStripePayment = async () => {
        try {
            const orderItems = cartItems.map(item => ({
                product: item.product.id,
                quantity: item.quantity
            }));

            const result = await handleOrderCreation(orderItems);
            return result; // Returns { orderId, paymentData }
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const handleStripePaymentSuccess = async (paymentResult) => {
        try {
            console.log("Payment successful, fetching updated order details...");

            // Wait a moment for the webhook to process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Fetch the complete order details with payment info
            const orderDetails = await getOrderDetails(paymentResult.order_id);

            if (orderDetails.success) {
                console.log("Updated order details:", orderDetails.order);
                onOrderCreated(orderDetails.order);
            } else {
                console.warn("Could not fetch updated order, using fallback data");
                // Create fallback order data with payment info
                const fallbackOrder = {
                    id: paymentResult.order_id,
                    status: 'processing',
                    total_price: total,
                    created_at: new Date().toISOString(),
                    payment_status: 'completed',
                    payment_method: 'card',
                    items: cartItems,
                    shipping_address: shippingAddress
                };
                onOrderCreated(fallbackOrder);
            }
        } catch (error) {
            console.error("Error after payment success:", error);
            // Fallback with basic order data
            const fallbackOrder = {
                id: paymentResult.order_id,
                status: 'processing',
                total_price: total,
                created_at: new Date().toISOString(),
                payment_status: 'completed',
                payment_method: 'card',
                items: cartItems,
                shipping_address: shippingAddress
            };
            onOrderCreated(fallbackOrder);
        }
    };

    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6">Checkout</h2>

                    {/* Progress Steps */}
                    <div className="flex justify-between mb-8">
                        <div className={`flex flex-col items-center ${step === 'address' ? 'text-orange-500' : 'text-gray-400'}`}>
                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">1</div>
                            <span className="text-sm mt-1">Address</span>
                        </div>
                        <div className={`flex flex-col items-center ${step === 'payment' ? 'text-orange-500' : 'text-gray-400'}`}>
                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">2</div>
                            <span className="text-sm mt-1">Payment</span>
                        </div>
                        <div className="flex flex-col items-center text-gray-400">
                            <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center">3</div>
                            <span className="text-sm mt-1">Confirmation</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {step === 'address' && (
                        <ShippingAddressForm
                            user={user}
                            onSubmit={handleAddressSubmit}
                            onCancel={onBack}
                        />
                    )}

                    {step === 'payment' && shippingAddress && (
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Order Summary</h3>
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm mb-1">
                                        <span>{item.product.name} × {item.quantity}</span>
                                        <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="border-t mt-2 pt-2 font-semibold">
                                    Total: ₹{total.toFixed(2)}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <PaymentMethodSelector
                                selectedMethod={paymentMethod}
                                onMethodChange={handlePaymentMethodChange}
                            />

                            {/* Payment Form */}
                            {paymentMethod === 'card' ? (
                                <StripePaymentForm
                                    order={{
                                        total_price: total,
                                        shipping_full_name: shippingAddress.full_name,
                                        shipping_phone: shippingAddress.phone_number,
                                        shipping_address: shippingAddress.address,
                                        shipping_district: shippingAddress.district,
                                        shipping_state: shippingAddress.state,
                                        shipping_pin_code: shippingAddress.pin_code,
                                        user_email: user.email,
                                        items: cartItems
                                    }}
                                    onPaymentInit={handleStripePayment}
                                    onPaymentSuccess={handleStripePaymentSuccess}
                                    onPaymentError={setError}
                                />
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-600 mb-4">
                                        You'll pay when your order is delivered.
                                    </p>
                                    <button
                                        onClick={handleCODPayment}
                                        disabled={loading}
                                        className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {loading ? 'Placing Order...' : 'Place Order (COD)'}
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => setStep('address')}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                ← Back to Address
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;