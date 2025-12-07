/**
 * Order Confirmation Page
 * Modern confirmation with QR code display
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Clock, MapPin, Phone } from 'lucide-react';
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

    const statusMessages: Record<string, { title: string; description: string; color: string }> = {
        pending: {
            title: 'En attente de paiement',
            description: 'Votre commande sera traitée dès réception du paiement.',
            color: 'text-amber-600',
        },
        paid: {
            title: 'Paiement confirmé !',
            description: 'Votre commande est en cours de préparation.',
            color: 'text-blue-600',
        },
        preparing: {
            title: 'En préparation',
            description: 'Nos chefs préparent votre commande avec soin.',
            color: 'text-purple-600',
        },
        ready: {
            title: 'Prête à retirer !',
            description: 'Votre commande vous attend au comptoir.',
            color: 'text-green-600',
        },
        completed: {
            title: 'Commande récupérée',
            description: 'Merci et bon appétit !',
            color: 'text-neutral-600',
        },
        cancelled: {
            title: 'Commande annulée',
            description: 'Cette commande a été annulée.',
            color: 'text-red-600',
        },
    };

    const status = statusMessages[order.status] || statusMessages.pending;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Success Header */}
            <section className="py-16 bg-gradient-to-b from-green-50 to-neutral-50">
                <div className="container-custom text-center">
                    <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className={`text-neutral-900 mb-4`}>
                        {status.title.toUpperCase()}
                    </h1>
                    <p className="text-neutral-600 text-lg">
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
                                <div className="card bg-white p-8 text-center">
                                    <p className="text-neutral-500">QR code non disponible</p>
                                </div>
                            )}
                        </div>

                        {/* Order Details */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="card bg-white p-6">
                                <h2 className="font-semibold text-xl text-neutral-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif', textTransform: 'none' }}>
                                    Détails de la commande
                                </h2>

                                <dl className="space-y-3">
                                    <div className="flex justify-between py-2 border-b border-neutral-100">
                                        <dt className="text-neutral-500">Commande n°</dt>
                                        <dd className="font-bold text-primary-600">#{order.order_number?.toString().padStart(4, '0')}</dd>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-neutral-100">
                                        <dt className="text-neutral-500">Statut</dt>
                                        <dd>
                                            <span className={`badge ${order.status === 'ready' ? 'badge-success' :
                                                    order.status === 'paid' || order.status === 'preparing' ? 'badge-primary' :
                                                        order.status === 'cancelled' ? 'badge-error' :
                                                            'badge-warning'
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
                                    <div className="flex justify-between py-2">
                                        <dt className="text-neutral-500">Total</dt>
                                        <dd className="font-bold text-xl text-primary-600">{formatPrice(order.total)}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Items */}
                            <div className="card bg-white p-6">
                                <h3 className="font-semibold text-neutral-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif', textTransform: 'none' }}>
                                    Articles commandés
                                </h3>
                                <ul className="space-y-3">
                                    {order.items?.map((item: { id: string; product_name: string; quantity: number; unit_price: number }) => (
                                        <li key={item.id} className="flex justify-between py-2 border-b border-neutral-50 last:border-0">
                                            <span className="text-neutral-600">
                                                {item.quantity}x {item.product_name}
                                            </span>
                                            <span className="font-medium text-neutral-900">
                                                {formatPrice(item.unit_price * item.quantity)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pickup Info */}
                            <div className="card bg-accent-50 border-accent-200 p-6">
                                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif', textTransform: 'none' }}>
                                    <MapPin className="w-5 h-5 text-accent-600" />
                                    Point de retrait
                                </h3>
                                <p className="text-neutral-700 mb-2">
                                    <strong>Canadian Burger & Pizza</strong>
                                </p>
                                <p className="text-neutral-600 text-sm">
                                    Rue de la Station 42<br />
                                    4900 Spa, Belgique
                                </p>
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-accent-200">
                                    <Clock className="w-4 h-4 text-accent-600" />
                                    <span className="text-sm text-neutral-600">Temps de préparation estimé: ~10 minutes</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
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
