/**
 * Order Confirmation Page
 * Displays order confirmation and QR code for pickup
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Clock, MapPin } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase';
import { generateQRCodeDataURI } from '@/lib/qr';
import { formatPrice } from '@/lib/stripe';
import QRDisplay from '@/components/QRDisplay';

export const metadata = {
    title: 'Confirmation de commande',
};

async function getOrder(orderId: string) {
    const supabase = await createServerSupabaseClient();

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items(*)
    `)
        .eq('id', orderId)
        .single();

    if (error || !order) {
        return null;
    }

    return order;
}

export default async function ConfirmationPage({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = await params;
    const order = await getOrder(orderId);

    if (!order) {
        notFound();
    }

    // Generate QR code if order has token
    let qrDataUri = '';
    if (order.qr_token) {
        try {
            qrDataUri = await generateQRCodeDataURI(order.id, order.qr_token, {
                width: 280,
                color: {
                    dark: '#18181b',
                    light: '#ffffff',
                },
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }

    const statusMessages: Record<string, { title: string; description: string }> = {
        pending: {
            title: 'En attente de paiement',
            description: 'Votre commande sera traitée dès réception du paiement.',
        },
        paid: {
            title: 'Paiement reçu!',
            description: 'Votre commande est en cours de préparation.',
        },
        preparing: {
            title: 'En préparation',
            description: 'Nos chefs préparent votre commande avec soin.',
        },
        ready: {
            title: 'Prête à retirer!',
            description: 'Votre commande vous attend au comptoir.',
        },
        completed: {
            title: 'Commande récupérée',
            description: 'Merci et bon appétit!',
        },
        cancelled: {
            title: 'Commande annulée',
            description: 'Cette commande a été annulée.',
        },
    };

    const status = statusMessages[order.status] || statusMessages.pending;

    return (
        <div className="min-h-screen">
            {/* Success Header */}
            <section className="py-16 bg-gradient-to-b from-success-500/10 to-transparent">
                <div className="container-custom text-center">
                    <div className="inline-flex p-4 bg-success-500/20 rounded-full mb-6">
                        <CheckCircle className="w-12 h-12 text-success-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        {status.title}
                    </h1>
                    <p className="text-dark-400 text-lg">
                        {status.description}
                    </p>
                </div>
            </section>

            {/* QR Code & Order Info */}
            <section className="section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* QR Code */}
                        <div className="flex justify-center">
                            {qrDataUri ? (
                                <QRDisplay
                                    qrDataUri={qrDataUri}
                                    orderId={order.id}
                                    orderNumber={order.order_number}
                                />
                            ) : (
                                <div className="card p-8 text-center">
                                    <p className="text-dark-400">QR code non disponible</p>
                                </div>
                            )}
                        </div>

                        {/* Order Details */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="card p-6">
                                <h2 className="font-bold text-xl mb-4">Détails de la commande</h2>

                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-dark-400">Commande n°</dt>
                                        <dd className="font-semibold">#{order.order_number?.toString().padStart(4, '0')}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-dark-400">Statut</dt>
                                        <dd>
                                            <span className={`badge ${order.status === 'ready' ? 'badge-success' :
                                                    order.status === 'paid' || order.status === 'preparing' ? 'badge-primary' :
                                                        'badge-accent'
                                                }`}>
                                                {order.status === 'pending' && 'En attente'}
                                                {order.status === 'paid' && 'Payée'}
                                                {order.status === 'preparing' && 'En préparation'}
                                                {order.status === 'ready' && 'Prête'}
                                                {order.status === 'completed' && 'Récupérée'}
                                                {order.status === 'cancelled' && 'Annulée'}
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-dark-400">Total</dt>
                                        <dd className="font-bold text-accent-400">{formatPrice(order.total)}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Items */}
                            <div className="card p-6">
                                <h3 className="font-bold mb-4">Articles commandés</h3>
                                <ul className="space-y-3">
                                    {order.items?.map((item: { id: string; product_name: string; quantity: number; unit_price: number }) => (
                                        <li key={item.id} className="flex justify-between">
                                            <span className="text-dark-300">
                                                {item.quantity}x {item.product_name}
                                            </span>
                                            <span className="font-semibold">
                                                {formatPrice(item.unit_price * item.quantity)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pickup Info */}
                            <div className="card p-6 bg-accent-400/10 border-accent-400/20">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-accent-400" />
                                    Point de retrait
                                </h3>
                                <p className="text-dark-300 mb-2">
                                    <strong>Canadian Burger & Pizza</strong>
                                </p>
                                <p className="text-dark-400 text-sm">
                                    Rue de la Station 42<br />
                                    4900 Spa, Belgique
                                </p>
                                <div className="flex items-center gap-2 mt-4 text-sm text-dark-400">
                                    <Clock className="w-4 h-4" />
                                    Temps de préparation estimé: ~10 minutes
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/menu" className="btn-primary flex-1 justify-center">
                                    Nouvelle commande
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link href="/account" className="btn-outline flex-1 justify-center">
                                    Voir mes commandes
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
