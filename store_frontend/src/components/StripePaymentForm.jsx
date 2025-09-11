// components/StripePaymentForm.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const StripeCardForm = ({ order, onPaymentSuccess, onPaymentError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        onPaymentError(''); // Clear previous errors

        if (!stripe || !elements) {
            onPaymentError('Stripe not loaded');
            setProcessing(false);
            return;
        }

        try {
            console.log("Creating payment for order:", order);

            // First create the order if it doesn't exist
            let orderId = order.id;
            if (orderId === 'pending') {
                const orderResult = await createOrder([
                    {
                        product: order.items[0].product.id,
                        quantity: order.items[0].quantity,
                        price: order.items[0].product.price
                    }
                ]);

                if (!orderResult.success) {
                    throw new Error(orderResult.error || 'Failed to create order');
                }
                orderId = orderResult.data.id;
            }

            // Create payment
            const paymentResult = await createPayment(orderId, 'card');

            if (!paymentResult.success) {
                throw new Error(paymentResult.error || 'Payment creation failed');
            }

            const { client_secret } = paymentResult.data;

            // Confirm payment with Stripe
            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: order.shipping_full_name,
                        email: order.user_email,
                        phone: order.shipping_phone,
                        address: {
                            line1: order.shipping_address,
                            city: order.shipping_district,
                            state: order.shipping_state,
                            postal_code: order.shipping_pin_code
                        }
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (result.paymentIntent.status === 'succeeded') {
                onPaymentSuccess(paymentResult.data);
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