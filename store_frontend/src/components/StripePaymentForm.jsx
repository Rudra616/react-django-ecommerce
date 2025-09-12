import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createOrder, createPayment } from '../apis';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripeCardForm = ({ order, onPaymentSuccess, onPaymentError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    // StripePaymentForm.jsx - Fix handleSubmit function
    // StripePaymentForm.jsx - Fix handleSubmit function
    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        onPaymentError('');

        if (!stripe || !elements) {
            onPaymentError('Stripe not loaded');
            setProcessing(false);
            return;
        }

        try {
            console.log("Creating order for payment");

            const orderItems = order.items.map(item => ({
                product: item.product.id,
                quantity: item.quantity
            }));

            console.log("Sending order data:", { items: orderItems });

            const orderResult = await createOrder(orderItems);

            if (!orderResult.success) {
                throw new Error(orderResult.error || 'Failed to create order');
            }

            const orderId = orderResult.orderId; // Use orderId from result
            console.log("Created order with ID:", orderId);

            const paymentResult = await createPayment(orderId, 'card');

            if (paymentResult.success) {
                const { client_secret } = paymentResult.data;

                const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                    payment_method: {
                        card: elements.getElement(CardElement),
                    },
                });

                if (stripeError) {
                    onPaymentError(stripeError.message);
                } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                    onPaymentSuccess({
                        order_id: orderId,
                        transaction_id: paymentIntent.id,
                        status: paymentIntent.status
                    });
                }
            } else {
                throw new Error(paymentResult.error || 'Failed to create payment intent');
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
            <div className="border p-4 rounded-lg">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                        },
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
                {processing ? 'Processing...' : `Pay $${order.total_price}`}
            </button>
        </form>
    );
};

const StripePaymentForm = ({ order, onPaymentSuccess, onPaymentError }) => {
    return (
        <Elements stripe={stripePromise}>
            <StripeCardForm
                order={order}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
            />
        </Elements>
    );
};

export default StripePaymentForm;