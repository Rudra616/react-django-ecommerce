// components/StripePaymentForm.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripeCardForm = ({ order, onPaymentInit, onPaymentSuccess, onPaymentError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);
    const [cardError, setCardError] = useState('');

    const handleCardChange = (event) => {
        setCardComplete(event.complete);
        if (event.error) {
            setCardError(event.error.message);
            onPaymentError(event.error.message);
        } else {
            setCardError('');
            onPaymentError('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        onPaymentError('');

        if (!stripe || !elements) {
            onPaymentError('Stripe not loaded');
            setProcessing(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            onPaymentError('Card input not available');
            setProcessing(false);
            return;
        }

        if (!cardComplete) {
            onPaymentError('Please complete your card details');
            setProcessing(false);
            return;
        }

        try {
            // Initialize payment and get order data
            const paymentInit = await onPaymentInit();
            if (!paymentInit) {
                throw new Error('Failed to initialize payment');
            }

            const { orderId, paymentData } = paymentInit;

            // Confirm payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                paymentData.client_secret,
                {
                    payment_method: {
                        card: cardElement,
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
                    },
                }
            );

            if (stripeError) {
                onPaymentError(stripeError.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onPaymentSuccess({
                    order_id: orderId,
                    transaction_id: paymentIntent.id,
                    status: paymentIntent.status
                });
            } else {
                onPaymentError('Payment failed. Please try again.');
            }

        } catch (error) {
            console.error("Payment error:", error);
            onPaymentError(error.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border p-4 rounded-lg bg-white">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                                backgroundColor: 'white',
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

            {cardError && (
                <p className="text-sm text-red-600">{cardError}</p>
            )}

            {!cardComplete && !cardError && (
                <p className="text-sm text-yellow-600">
                    Please enter complete card details
                </p>
            )}

            <button
                type="submit"
                disabled={!stripe || processing || !cardComplete}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {processing ? 'Processing...' : `Pay ₹${order.total_price}`}
            </button>
        </form>
    );
};

const StripePaymentForm = ({ order, onPaymentInit, onPaymentSuccess, onPaymentError }) => {
    const [stripeLoaded, setStripeLoaded] = useState(false);

    useEffect(() => {
        const checkStripe = async () => {
            try {
                const stripeInstance = await stripePromise;
                setStripeLoaded(!!stripeInstance);
            } catch (error) {
                console.error("Stripe loading error:", error);
                onPaymentError("Payment system unavailable");
            }
        };

        checkStripe();
    }, [onPaymentError]);

    if (!stripeLoaded) {
        return (
            <div className="text-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payment system...</p>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise}>
            <StripeCardForm
                order={order}
                onPaymentInit={onPaymentInit}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
            />
        </Elements>
    );
};

export default StripePaymentForm;