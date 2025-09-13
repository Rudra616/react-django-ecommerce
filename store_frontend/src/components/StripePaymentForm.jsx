// components/StripePaymentForm.jsx - COMPLETE FIXED VERSION
import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe outside the component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Inner component that uses Stripe hooks
const StripeCardForm = ({ order, onPaymentInit, onPaymentSuccess, onPaymentError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cardComplete, setCardComplete] = useState(false);

    const handleCardChange = (event) => {
        setCardComplete(event.complete);
        if (event.error) {
            setError(event.error.message);
            onPaymentError(event.error.message);
        } else {
            setError('');
            onPaymentError('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            setError('Stripe not loaded yet');
            return;
        }

        if (!cardComplete) {
            setError('Please complete your card details');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Initialize payment and get payment data
            const paymentResult = await onPaymentInit();

            if (!paymentResult) {
                throw new Error('Failed to initialize payment');
            }

            const { orderId, paymentData } = paymentResult;

            // ✅ GET CLIENT_SECRET FROM PAYMENT DATA
            const clientSecret = paymentData.client_secret;

            if (!clientSecret) {
                throw new Error('Missing client secret for payment confirmation');
            }

            console.log("Confirming payment with client secret:", clientSecret);

            // Confirm card payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: order.shipping_full_name || 'Customer',
                        email: order.user_email,
                        phone: order.shipping_phone,
                        address: {
                            line1: order.shipping_address,
                            city: order.shipping_district,
                            state: order.shipping_state,
                            postal_code: order.shipping_pin_code,
                            country: 'IN',
                        }
                    }
                }
            });

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            console.log("Payment intent result:", paymentIntent);

            if (paymentIntent.status === 'succeeded') {
                // Payment successful
                await onPaymentSuccess({
                    order_id: orderId,
                    payment_intent_id: paymentIntent.id,
                    status: paymentIntent.status
                });
            } else {
                throw new Error(`Payment status: ${paymentIntent.status}`);
            }

        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message);
            onPaymentError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stripe-payment-form">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-3 text-gray-800">Card Details</h3>
                    <div className="border p-3 rounded bg-gray-50">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                        backgroundColor: 'transparent',
                                    },
                                    invalid: {
                                        color: '#9e2146',
                                    },
                                },
                                hidePostalCode: false,
                            }}
                            onChange={handleCardChange}
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {!cardComplete && !error && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                        Please complete your card details above
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!stripe || loading || !cardComplete}
                    className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-lg"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Payment...
                        </span>
                    ) : (
                        `Pay ₹${order.total_price}`
                    )}
                </button>
            </form>
        </div>
    );
};

// Outer wrapper component that provides Elements context
const StripePaymentForm = (props) => {
    return (
        <Elements stripe={stripePromise}>
            <StripeCardForm {...props} />
        </Elements>
    );
};

export default StripePaymentForm;