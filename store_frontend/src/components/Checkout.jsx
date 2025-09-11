import React, { useState } from 'react';
import { createOrder, createPayment } from '../apis';
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

    const handleCODPayment = async () => {
        setLoading(true);
        setError('');

        try {
            console.log("Creating COD order with items:", cartItems);

            const orderItems = cartItems.map(item => {
                const productObject = item.product || {};
                const productId = productObject.id || item.product_id;

                if (!productId) {
                    throw new Error("Product ID not found in cart item.");
                }

                return {
                    product: productId,
                    quantity: item.quantity
                };
            });

            console.log("Sending order data:", { items: orderItems });

            const orderResult = await createOrder(orderItems);

            if (!orderResult.success) {
                throw new Error(orderResult.error || 'Failed to create order');
            }

            onOrderCreated(orderResult.data);

        } catch (err) {
            setError(err.message);
            console.error("COD payment error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStripePaymentSuccess = (paymentData) => {
        onOrderCreated(paymentData);
    };

    const handleStripePaymentError = (errorMessage) => {
        setError(errorMessage);
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
                                        <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="border-t mt-2 pt-2 font-semibold">
                                    Total: ${total.toFixed(2)}
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
                                        id: 'pending',
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
                                    onPaymentSuccess={handleStripePaymentSuccess}
                                    onPaymentError={handleStripePaymentError}
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