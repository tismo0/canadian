/**
 * Stripe Webhook Handler
 * Handles payment confirmations and updates order status
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminSupabaseClient } from '@/lib/supabase';

// Disable body parsing for webhook signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    if (!stripe) {
        console.error('Stripe not configured');
        return NextResponse.json(
            { error: 'Stripe non configuré' },
            { status: 503 }
        );
    }

    if (!webhookSecret) {
        console.error('Webhook secret not configured');
        return NextResponse.json(
            { error: 'Webhook secret non configuré' },
            { status: 503 }
        );
    }

    try {
        // Get raw body for signature verification
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Signature manquante' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json(
                { error: 'Signature invalide' },
                { status: 400 }
            );
        }

        const adminSupabase = createAdminSupabaseClient();

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderId = session.metadata?.order_id;

                if (!orderId) {
                    console.error('No order_id in session metadata');
                    break;
                }

                console.log(`Processing payment for order ${orderId}`);

                // Update order status
                const { error } = await adminSupabase
                    .from('orders')
                    .update({
                        status: 'paid',
                        payment_status: 'succeeded',
                        payment_intent_id: session.payment_intent as string,
                    })
                    .eq('id', orderId);

                if (error) {
                    console.error('Error updating order:', error);
                } else {
                    console.log(`Order ${orderId} marked as paid`);
                }
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                // Find order by payment_intent_id
                const { data: order, error: fetchError } = await adminSupabase
                    .from('orders')
                    .select('id, status')
                    .eq('payment_intent_id', paymentIntent.id)
                    .single();

                if (fetchError || !order) {
                    console.log('No order found for payment intent:', paymentIntent.id);
                    break;
                }

                // Only update if not already paid
                if (order.status === 'pending') {
                    const { error } = await adminSupabase
                        .from('orders')
                        .update({
                            status: 'paid',
                            payment_status: 'succeeded',
                        })
                        .eq('id', order.id);

                    if (error) {
                        console.error('Error updating order:', error);
                    }
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                const { data: order } = await adminSupabase
                    .from('orders')
                    .select('id')
                    .eq('payment_intent_id', paymentIntent.id)
                    .single();

                if (order) {
                    await adminSupabase
                        .from('orders')
                        .update({
                            payment_status: 'failed',
                        })
                        .eq('id', order.id);

                    console.log(`Payment failed for order ${order.id}`);
                }
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;

                if (charge.payment_intent) {
                    const { data: order } = await adminSupabase
                        .from('orders')
                        .select('id')
                        .eq('payment_intent_id', charge.payment_intent as string)
                        .single();

                    if (order) {
                        await adminSupabase
                            .from('orders')
                            .update({
                                status: 'cancelled',
                                payment_status: 'refunded',
                            })
                            .eq('id', order.id);

                        console.log(`Order ${order.id} refunded`);
                    }
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Erreur webhook' },
            { status: 500 }
        );
    }
}
