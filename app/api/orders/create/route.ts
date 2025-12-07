/**
 * Create Order API Route
 * Creates order and initiates Stripe Checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient, getCurrentUser } from '@/lib/supabase';
import { stripe, priceToCents } from '@/lib/stripe';
import { generateOrderToken } from '@/lib/qr';
import { createOrderSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const validation = createOrderSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Données invalides', details: validation.error.errors },
                { status: 400 }
            );
        }

        const { items, customer_name, customer_email, customer_phone, notes } = validation.data;

        // Check Stripe configuration
        if (!stripe) {
            console.error('Stripe not configured');
            return NextResponse.json(
                { error: 'Service de paiement non disponible' },
                { status: 503 }
            );
        }

        // Get current user (optional - guest checkout allowed)
        const user = await getCurrentUser();

        // Use admin client to bypass RLS for fetching products
        const adminSupabase = createAdminSupabaseClient();

        // Fetch products to calculate prices
        const productIds = items.map(item => item.product_id);
        const { data: products, error: productsError } = await adminSupabase
            .from('products')
            .select('id, name, price, is_available')
            .in('id', productIds);

        if (productsError || !products) {
            console.error('Error fetching products:', productsError);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des produits' },
                { status: 500 }
            );
        }

        // Validate all products are available
        const productMap = new Map(products.map(p => [p.id, p]));
        const orderItems = [];
        let total = 0;

        for (const item of items) {
            const product = productMap.get(item.product_id);

            if (!product) {
                return NextResponse.json(
                    { error: `Produit non trouvé: ${item.product_id}` },
                    { status: 400 }
                );
            }

            if (!product.is_available) {
                return NextResponse.json(
                    { error: `Produit indisponible: ${product.name}` },
                    { status: 400 }
                );
            }

            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                quantity: item.quantity,
                unit_price: product.price,
                total_price: itemTotal,
                notes: item.notes,
            });
        }

        // Generate QR token
        const qrToken = generateOrderToken();

        // Create order in database
        // For guest users, we need to create a temporary profile or handle guest orders
        // For now, if no user, we'll use admin client to create the order

        let userId = user?.id;

        // If no user, create a guest order (admin client bypasses RLS)
        const { data: order, error: orderError } = await adminSupabase
            .from('orders')
            .insert({
                user_id: userId || '00000000-0000-0000-0000-000000000000', // Guest user placeholder
                status: 'pending',
                total,
                qr_token: qrToken,
                customer_name,
                customer_phone,
                customer_email,
                notes,
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error('Error creating order:', orderError);
            return NextResponse.json(
                { error: 'Erreur lors de la création de la commande' },
                { status: 500 }
            );
        }

        // Create order items
        const orderItemsData = orderItems.map(item => ({
            ...item,
            order_id: order.id,
        }));

        const { error: itemsError } = await adminSupabase
            .from('order_items')
            .insert(orderItemsData);

        if (itemsError) {
            console.error('Error creating order items:', itemsError);
            // Rollback: delete the order
            await adminSupabase.from('orders').delete().eq('id', order.id);
            return NextResponse.json(
                { error: 'Erreur lors de la création des articles' },
                { status: 500 }
            );
        }

        // Create Stripe Checkout Session
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card', 'bancontact'],
            customer_email,
            line_items: orderItems.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.product_name,
                    },
                    unit_amount: priceToCents(item.unit_price),
                },
                quantity: item.quantity,
            })),
            metadata: {
                order_id: order.id,
                customer_name,
                customer_phone,
            },
            success_url: `${appUrl}/confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/cart?cancelled=true`,
        });

        // Update order with payment intent ID
        if (session.payment_intent) {
            await adminSupabase
                .from('orders')
                .update({ payment_intent_id: session.payment_intent as string })
                .eq('id', order.id);
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            sessionId: session.id,
            url: session.url,
        });

    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
