import React, { useState, useEffect } from 'react'; // ← Add useEffect import
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createOrder, createPayment } from '../apis';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripeCardForm = ({ order, onPaymentSuccess, onPaymentError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

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
            console.log("Creating order for payment with items:", order.items);

            const orderItems = order.items.map(item => {
                // Extract product ID safely
                let productId;

                if (item.product && item.product.id) {
                    productId = item.product.id;
                } else if (item.product_id) {
                    productId = item.product_id;
                } else if (typeof item.product === 'number') {
                    productId = item.product;
                } else {
                    console.error("Invalid product structure:", item);
                    throw new Error("Invalid product in cart item");
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

            const orderId = orderResult.orderId;
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
    const [stripeLoaded, setStripeLoaded] = useState(false); // ← Add loading state here
    const [stripeError, setStripeError] = useState('');

    useEffect(() => {
        const checkStripe = async () => {
            try {
                const stripeInstance = await stripePromise;
                setStripeLoaded(!!stripeInstance);
                if (!stripeInstance) {
                    setStripeError("Failed to load payment system");
                }
            } catch (error) {
                console.error("Stripe loading error:", error);
                setStripeError("Payment system unavailable. Please try again.");
                onPaymentError("Payment system unavailable. Please try again.");
            }
        };

        checkStripe();
    }, [onPaymentError]);

    // Show loading state or error
    if (!stripeLoaded) {
        return (
            <div className="text-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payment system...</p>
                {stripeError && <p className="text-red-500 text-sm mt-2">{stripeError}</p>}
            </div>
        );
    }

    if (stripeError) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{stripeError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-red-600 text-white px-4 py-2 rounded text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

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