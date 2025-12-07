/**
 * Admin Dashboard Page
 * Real-time orders view with status management
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Clock,
    TrendingUp,
    Users,
    ChefHat,
    AlertCircle,
    Check,
    X,
    Download,
    RefreshCw,
    Loader2
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
            </div>
        );
    }

    const statusConfig: Record<OrderStatus, { label: string; color: string; next?: OrderStatus }> = {
        pending: { label: 'En attente', color: 'bg-amber-500', next: 'paid' },
        paid: { label: 'Payée', color: 'bg-blue-500', next: 'preparing' },
        preparing: { label: 'En préparation', color: 'bg-purple-500', next: 'ready' },
        ready: { label: 'Prête', color: 'bg-green-500', next: 'completed' },
        completed: { label: 'Récupérée', color: 'bg-gray-500' },
        cancelled: { label: 'Annulée', color: 'bg-red-500' },
    };

    return (
        <div className="min-h-screen bg-dark-950">
            {/* Header */}
            <div className="bg-dark-900 border-b border-white/5">
                <div className="container-custom py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <ChefHat className="w-8 h-8 text-primary-400" />
                                Dashboard Admin
                            </h1>
                            <p className="text-dark-400 text-sm mt-1">
                                Bienvenue, {profile?.full_name}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchOrders}
                                className="btn-outline btn-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Rafraîchir
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="btn-outline btn-sm"
                            >
                                <Download className="w-4 h-4" />
                                Exporter CSV
                            </button>
                            <Link href="/admin/products" className="btn-primary btn-sm">
                                Gérer les produits
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-4">
                        <Package className="w-8 h-8 text-accent-400 mb-2" />
                        <p className="text-3xl font-bold">{stats.total}</p>
                        <p className="text-sm text-dark-400">Commandes</p>
                    </div>
                    <div className="card p-4">
                        <Clock className="w-8 h-8 text-amber-400 mb-2" />
                        <p className="text-3xl font-bold">{stats.pending}</p>
                        <p className="text-sm text-dark-400">En cours</p>
                    </div>
                    <div className="card p-4">
                        <AlertCircle className="w-8 h-8 text-green-400 mb-2" />
                        <p className="text-3xl font-bold">{stats.ready}</p>
                        <p className="text-sm text-dark-400">Prêtes</p>
                    </div>
                    <div className="card p-4">
                        <TrendingUp className="w-8 h-8 text-primary-400 mb-2" />
                        <p className="text-3xl font-bold">{formatPrice(stats.revenue)}</p>
                        <p className="text-sm text-dark-400">Revenus</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {(['all', 'paid', 'preparing', 'ready', 'completed'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === status
                                ? 'bg-primary-600 text-white'
                                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                                }`}
                        >
                            {status === 'all' ? 'Toutes' : statusConfig[status]?.label}
                            <span className="ml-2 opacity-60">
                                {status === 'all'
                                    ? orders.length
                                    : orders.filter(o => o.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-dark-800/50">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-dark-400">Commande</th>
                                    <th className="text-left p-4 text-sm font-medium text-dark-400">Client</th>
                                    <th className="text-left p-4 text-sm font-medium text-dark-400">Articles</th>
                                    <th className="text-left p-4 text-sm font-medium text-dark-400">Total</th>
                                    <th className="text-left p-4 text-sm font-medium text-dark-400">Statut</th>
                                    <th className="text-left p-4 text-sm font-medium text-dark-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence>
                                    {filteredOrders.map((order) => {
                                        const config = statusConfig[order.status];
                                        return (
                                            <motion.tr
                                                key={order.id}
                                                initial={{ opacity: 0, backgroundColor: 'rgba(234, 179, 8, 0.2)' }}
                                                animate={{ opacity: 1, backgroundColor: 'transparent' }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-dark-800/30"
                                            >
                                                <td className="p-4">
                                                    <p className="font-bold">#{order.order_number?.toString().padStart(4, '0')}</p>
                                                    <p className="text-xs text-dark-500">
                                                        {new Date(order.created_at).toLocaleTimeString('fr-BE', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-medium">{order.customer_name}</p>
                                                    <p className="text-sm text-dark-400">{order.customer_phone}</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm text-dark-300">
                                                        {order.items?.length || 0} article(s)
                                                    </p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-bold text-accent-400">{formatPrice(order.total)}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white ${config.color}`}>
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        {config.next && (
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, config.next!)}
                                                                className="p-2 bg-success-500/20 text-success-500 rounded-lg hover:bg-success-500/30 transition-colors"
                                                                title={`Passer à "${statusConfig[config.next].label}"`}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                                className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                                                title="Annuler"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            className="p-2 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors"
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
                            <Package className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                            <p className="text-dark-400">Aucune commande trouvée</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
