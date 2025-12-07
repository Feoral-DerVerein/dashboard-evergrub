import { loadStripe } from '@stripe/stripe-js';

// Load the Publishable Key from the environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn("VITE_STRIPE_PUBLISHABLE_KEY is missing. Stripe will not initialize properly.");
}

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY || '');

export const STRIPE_PLANS = {
    ALL_IN_ONE: {
        priceId: 'price_1Q...', // REPLACE THIS WITH YOUR REAL STRIPE PRICE ID (e.g., price_1Pxyz...)
        amount: 15000, // €150.00
        currency: 'eur',
        name: 'All-In-One Access'
    }
};
