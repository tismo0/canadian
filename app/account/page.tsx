/**
 * Account Page
 * User profile and order history
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Package, Settings, LogOut, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';
import type { Order } from '@/types/database';

export default function AccountPage() {
    const { user, profile, signOut, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (!error && data) {
            setOrders(data);
        }
        setLoadingOrders(false);
    };

    // Redirect if not logged in
    if (!authLoading && !user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <User className="w-16 h-16 text-dark-600 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Connectez-vous</h1>
                <p className="text-dark-400 mb-6">Accédez à votre compte pour voir vos commandes.</p>
                <Link href="/login" className="btn-primary">Se connecter</Link>
            </div>
        );
    }

    if (authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
            </div>
        );
    }

    const statusLabels: Record<string, { label: string; color: string }> = {
        pending: { label: 'En attente', color: 'status-pending' },
        paid: { label: 'Payée', color: 'status-paid' },
        preparing: { label: 'En préparation', color: 'status-preparing' },
        ready: { label: 'Prête', color: 'status-ready' },
        completed: { label: 'Récupérée', color: 'status-completed' },
        cancelled: { label: 'Annulée', color: 'status-cancelled' },
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <section className="bg-dark-900/50 border-b border-white/5">
                <div className="container-custom py-8">
                    <h1 className="text-3xl font-bold">Mon compte</h1>
                </div>
            </section>

            <section className="section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="card p-6">
                                {/* User Info */}
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                                    <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-primary-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold">{profile?.full_name || 'Utilisateur'}</h2>
                                        <p className="text-sm text-dark-400">{user?.email}</p>
                                    </div>
                                </div>

                                {/* Navigation */}
                                <nav className="space-y-1">
                                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-600/20 text-primary-400">
                                        <Package className="w-5 h-5" />
                                        Mes commandes
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-dark-300 hover:bg-dark-800 transition-colors">
                                        <Settings className="w-5 h-5" />
                                        Paramètres
                                    </button>
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-primary-400 transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Déconnexion
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Orders */}
                        <div className="lg:col-span-2">
                            <div className="card">
                                <div className="p-6 border-b border-white/10">
                                    <h2 className="font-bold text-xl">Mes commandes</h2>
                                </div>

                                {loadingOrders ? (
                                    <div className="p-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-accent-400 mx-auto" />
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Package className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                                        <h3 className="font-semibold mb-2">Aucune commande</h3>
                                        <p className="text-dark-400 mb-6">Vous n'avez pas encore passé de commande.</p>
                                        <Link href="/menu" className="btn-primary">Commander maintenant</Link>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-white/5">
                                        {orders.map((order) => {
                                            const status = statusLabels[order.status] || statusLabels.pending;
                                            return (
                                                <motion.li
                                                    key={order.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    <Link
                                                        href={`/confirmation/${order.id}`}
                                                        className="flex items-center justify-between p-4 hover:bg-dark-800/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-dark-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">
                                                                    Commande #{order.order_number?.toString().padStart(4, '0')}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-sm text-dark-400">
                                                                    <Clock className="w-3 h-3" />
                                                                    {new Date(order.created_at).toLocaleDateString('fr-BE', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="font-bold text-accent-400">
                                                                    {formatPrice(order.total)}
                                                                </p>
                                                                <span className={`badge ${status.color}`}>
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-dark-500" />
                                                        </div>
                                                    </Link>
                                                </motion.li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
