/**
 * QR Code Scan API Route
 * Validates QR code and returns order details for staff
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isStaff } from '@/lib/supabase';
import { validateQRCode } from '@/lib/qr';
import { qrScanSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        // Check if user is staff or admin
        const hasAccess = await isStaff();
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = qrScanSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Données QR invalides' },
                { status: 400 }
            );
        }

        const { qr_data } = validation.data;

        // Validate QR code signature
        const qrValidation = validateQRCode(qr_data);

        if (!qrValidation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: qrValidation.error || 'QR code invalide'
                },
                { status: 400 }
            );
        }

        const orderId = qrValidation.orderId!;

        // Fetch order details
        const supabase = await createServerSupabaseClient();

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
        *,
        items:order_items(
          id,
          product_name,
          quantity,
          unit_price,
          notes
        )
      `)
            .eq('id', orderId)
            .single();

        if (error || !order) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Commande non trouvée'
                },
                { status: 404 }
            );
        }

        // Check order status
        if (order.status === 'completed') {
            return NextResponse.json({
                success: false,
                error: 'Cette commande a déjà été récupérée',
                order: {
                    id: order.id,
                    order_number: order.order_number,
                    status: order.status,
                    completed_at: order.completed_at,
                },
            });
        }

        if (order.status === 'cancelled') {
            return NextResponse.json({
                success: false,
                error: 'Cette commande a été annulée',
                order: {
                    id: order.id,
                    order_number: order.order_number,
                    status: order.status,
                },
            });
        }

        if (order.payment_status !== 'succeeded') {
            return NextResponse.json({
                success: false,
                error: 'Le paiement n\'a pas été confirmé',
                order: {
                    id: order.id,
                    order_number: order.order_number,
                    status: order.status,
                    payment_status: order.payment_status,
                },
            });
        }

        // Return order details for staff
        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                order_number: order.order_number,
                status: order.status,
                total: order.total,
                customer_name: order.customer_name,
                customer_phone: order.customer_phone,
                items: order.items,
                notes: order.notes,
                created_at: order.created_at,
            },
        });

    } catch (error) {
        console.error('QR scan error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

/**
 * Mark order as completed via QR scan
 */
export async function PATCH(request: NextRequest) {
    try {
        // Check if user is staff or admin
        const hasAccess = await isStaff();
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { order_id } = body;

        if (!order_id) {
            return NextResponse.json(
                { error: 'ID de commande requis' },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();

        // Update order status to completed
        const { data: order, error } = await supabase
            .from('orders')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', order_id)
            .select()
            .single();

        if (error) {
            console.error('Error completing order:', error);
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Commande marquée comme récupérée',
            order: {
                id: order.id,
                order_number: order.order_number,
                status: order.status,
                completed_at: order.completed_at,
            },
        });

    } catch (error) {
        console.error('Complete order error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
