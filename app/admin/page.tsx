/**
 * Admin Dashboard Page
 * Modern admin panel with professional light theme
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Clock,
    TrendingUp,
    ChefHat,
    AlertCircle,
    Check,
    X,
    Download,
    RefreshCw,
    Loader2,
    QrCode,
    Megaphone,
    ShoppingBag
} from 'lucide-react';
import { useAuth, useRequireAdmin } from '@/contexts/auth-context';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';
import type { Order, OrderStatus } from '@/types/database';

export default function AdminDashboardPage() {
    const { profile, loading: authLoading } = useRequireAdmin();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        if (profile?.role === 'admin') {
            fetchOrders();
            subscribeToOrders();
        }
    }, [profile]);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        items:order_items(*)
      `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            setOrders(data);
        }
        setLoading(false);
    };

    const subscribeToOrders = () => {
        const subscription = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setOrders(prev => [payload.new as Order, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setOrders(prev =>
                            prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    };

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (!error) {
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
        }
    };

    const exportToCSV = () => {
        const headers = ['N°', 'Client', 'Téléphone', 'Total', 'Statut', 'Date'];
        const rows = orders.map(o => [
            o.order_number,
            o.customer_name,
            o.customer_phone,
            o.total,
            o.status,
            new Date(o.created_at).toLocaleString('fr-BE'),
        ]);

        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'paid' || o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        revenue: orders.filter(o => o.payment_status === 'succeeded').reduce((sum, o) => sum + o.total, 0),
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; next?: OrderStatus }> = {
        pending: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-100', next: 'paid' },
        paid: { label: 'Payée', color: 'text-blue-700', bg: 'bg-blue-100', next: 'preparing' },
        preparing: { label: 'En préparation', color: 'text-purple-700', bg: 'bg-purple-100', next: 'ready' },
        ready: { label: 'Prête', color: 'text-green-700', bg: 'bg-green-100', next: 'completed' },
        completed: { label: 'Récupérée', color: 'text-neutral-600', bg: 'bg-neutral-100' },
        cancelled: { label: 'Annulée', color: 'text-red-700', bg: 'bg-red-100' },
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl text-neutral-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                    <ChefHat className="w-5 h-5 text-white" />
                                </div>
                                DASHBOARD ADMIN
                            </h1>
                            <p className="text-neutral-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Bienvenue, {profile?.full_name}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={fetchOrders}
                                className="btn-secondary btn-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Rafraîchir
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="btn-secondary btn-sm"
                            >
                                <Download className="w-4 h-4" />
                                Exporter
                            </button>
                            <Link href="/admin/scan" className="btn-secondary btn-sm">
                                <QrCode className="w-4 h-4" />
                                Scanner
                            </Link>
                            <Link href="/admin/products" className="btn-primary btn-sm">
                                <ShoppingBag className="w-4 h-4" />
                                Produits
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card bg-white p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-accent-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-display text-neutral-900">{stats.total}</p>
                        <p className="text-sm text-neutral-500">Commandes</p>
                    </div>
                    <div className="card bg-white p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-display text-neutral-900">{stats.pending}</p>
                        <p className="text-sm text-neutral-500">En cours</p>
                    </div>
                    <div className="card bg-white p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-display text-neutral-900">{stats.ready}</p>
                        <p className="text-sm text-neutral-500">Prêtes</p>
                    </div>
                    <div className="card bg-white p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-display text-primary-600">{formatPrice(stats.revenue)}</p>
                        <p className="text-sm text-neutral-500">Revenus</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {(['all', 'paid', 'preparing', 'ready', 'completed'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === status
                                ? 'bg-primary-600 text-white shadow-red'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                                }`}
                        >
                            {status === 'all' ? 'Toutes' : statusConfig[status]?.label}
                            <span className="ml-2 opacity-70">
                                {status === 'all'
                                    ? orders.length
                                    : orders.filter(o => o.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Orders Table */}
                <div className="card bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100">
                                    <th className="text-left p-4 text-sm font-semibold text-neutral-600">Commande</th>
                                    <th className="text-left p-4 text-sm font-semibold text-neutral-600">Client</th>
                                    <th className="text-left p-4 text-sm font-semibold text-neutral-600">Articles</th>
                                    <th className="text-left p-4 text-sm font-semibold text-neutral-600">Total</th>
                                    <th className="text-left p-4 text-sm font-semibold text-neutral-600">Statut</th>
                                    <th className="text-left p-4 text-sm font-semibold text-neutral-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                <AnimatePresence>
                                    {filteredOrders.map((order) => {
                                        const config = statusConfig[order.status];
                                        return (
                                            <motion.tr
                                                key={order.id}
                                                initial={{ opacity: 0, backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                                                animate={{ opacity: 1, backgroundColor: 'transparent' }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-neutral-50"
                                            >
                                                <td className="p-4">
                                                    <p className="font-bold text-neutral-900">#{order.order_number?.toString().padStart(4, '0')}</p>
                                                    <p className="text-xs text-neutral-400">
                                                        {new Date(order.created_at).toLocaleTimeString('fr-BE', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-medium text-neutral-900">{order.customer_name}</p>
                                                    <p className="text-sm text-neutral-500">{order.customer_phone}</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm text-neutral-600">
                                                        {order.items?.length || 0} article(s)
                                                    </p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-bold text-primary-600">{formatPrice(order.total)}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        {config.next && (
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, config.next!)}
                                                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                                title={`Passer à "${statusConfig[config.next].label}"`}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                                title="Annuler"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            className="p-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
                                                        >
                                                            Détails
                                                        </Link>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="p-12 text-center">
                            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                            <p className="text-neutral-500">Aucune commande trouvée</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
