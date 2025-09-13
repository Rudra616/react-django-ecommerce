// components/StripePaymentWrapper.jsx
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePaymentWrapper = ({ order, onPaymentInit, onPaymentSuccess, onPaymentError }) => {
    return (
        <Elements stripe={stripePromise}>
            <StripePaymentForm
                order={order}
                onPaymentInit={onPaymentInit}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
            />
        </Elements>
    );
};

export default StripePaymentWrapper;