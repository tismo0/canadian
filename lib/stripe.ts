/**
 * Stripe client configuration
 * Provides both server-side and client-side Stripe instances
 */

import Stripe from 'stripe';
import { loadStripe, type Stripe as StripeJs } from '@stripe/stripe-js';

// Server-side Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && typeof window === 'undefined') {
    console.warn('Missing STRIPE_SECRET_KEY - Stripe payments will not work');
}

/**
 * Server-side Stripe instance
 * Use only in API routes and server actions
 */
export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, {
        typescript: true,
    })
    : null;

// Client-side Stripe promise (singleton)
let stripePromise: Promise<StripeJs | null> | null = null;

/**
 * Get the client-side Stripe instance
 * Lazy-loaded singleton pattern
 */
export function getStripe(): Promise<StripeJs | null> {
    if (!stripePromise) {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            console.warn('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
            return Promise.resolve(null);
        }

        stripePromise = loadStripe(publishableKey);
    }

    return stripePromise;
}

/**
 * Format price for display (in euros)
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-BE', {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
}

/**
 * Convert price to cents for Stripe (Stripe uses smallest currency unit)
 */
export function priceToCents(price: number): number {
    return Math.round(price * 100);
}

/**
 * Convert cents to price (for display from Stripe amounts)
 */
export function centsToPrice(cents: number): number {
    return cents / 100;
}
