/**
 * Customer Account Page
 * Shows loyalty points and personal QR code
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
    Star,
    Gift,
    History,
    User,
    LogOut,
    ChevronRight,
    Sparkles,
    Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';

// Points tiers
const TIERS = [
    { name: 'Bronze', min: 0, max: 99, color: '#CD7F32', icon: Star },
    { name: 'Argent', min: 100, max: 299, color: '#C0C0C0', icon: Sparkles },
    { name: 'Or', min: 300, max: 599, color: '#D4AF37', icon: Crown },
    { name: 'Platine', min: 600, max: Infinity, color: '#E5E4E2', icon: Crown },
];

export default function AccountPage() {
    const router = useRouter();
    const { user, profile, signOut } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState(0);
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/account');
            return;
        }
        fetchData();
    }, [user, router]);

    const fetchData = async () => {
        if (!user) return;

        // Fetch orders
        try {
            const { data: ordersData } = await (supabase as any)
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (ordersData) setOrders(ordersData);

            // Calculate points from orders (1€ = 1 point)
            const totalSpent = (ordersData || [])
                .filter((o: any) => o.payment_status === 'succeeded')
                .reduce((sum: number, o: any) => sum + o.total, 0);
            setPoints(Math.floor(totalSpent));
        } catch (err) {
            console.error('Error fetching data:', err);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    // Get current tier
    const currentTier = TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];
    const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
    const progress = nextTier
        ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
        : 100;

    // Generate unique QR token for this user
    const loyaltyQRData = user ? JSON.stringify({
        type: 'loyalty',
        userId: user.id,
        email: user.email,
        timestamp: Date.now()
    }) : '';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-3xl font-bold mb-2">Mon Compte</h1>
                    <p className="text-dark-400">{user.email}</p>
                </motion.div>

                {/* Points Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="points-card"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-dark-900/60 text-sm font-medium uppercase tracking-wider">
                                Mes Points Fidélité
                            </p>
                            <p className="points-value">{points}</p>
                        </div>
                        <div
                            className="flex items-center gap-2 px-3 py-1 rounded-full"
                            style={{ backgroundColor: `${currentTier.color}30` }}
                        >
                            <currentTier.icon className="w-4 h-4" style={{ color: currentTier.color }} />
                            <span className="font-bold text-sm" style={{ color: currentTier.color }}>
                                {currentTier.name}
                            </span>
                        </div>
                    </div>

                    {/* Progress to next tier */}
                    {nextTier && (
                        <div className="mt-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-dark-900/60">Prochain niveau: {nextTier.name}</span>
                                <span className="font-bold">{nextTier.min - points} pts restants</span>
                            </div>
                            <div className="h-2 bg-dark-900/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full bg-dark-900/40 rounded-full"
                                />
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* QR Code */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-6"
                >
                    <h3 className="text-lg font-bold mb-4 text-center">Ma Carte Fidélité</h3>
                    <div className="flex justify-center">
                        <div className="qr-container">
                            <QRCodeSVG
                                value={loyaltyQRData}
                                size={180}
                                level="H"
                                includeMargin={false}
                                className="qr-code"
                                bgColor="#FFFFFF"
                                fgColor="#1a1614"
                            />
                        </div>
                    </div>
                    <p className="text-center text-dark-400 text-sm mt-4">
                        Présentez ce QR code pour collecter vos points
                    </p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 gap-4"
                >
                    <Link href="/menu" className="card p-4 card-hover flex flex-col items-center gap-2">
                        <Gift className="w-8 h-8 text-accent-400" />
                        <span className="font-medium">Commander</span>
                    </Link>
                    <button className="card p-4 card-hover flex flex-col items-center gap-2" disabled>
                        <Star className="w-8 h-8 text-accent-400" />
                        <span className="font-medium">Récompenses</span>
                        <span className="text-xs text-dark-400">Bientôt</span>
                    </button>
                </motion.div>

                {/* Order History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card overflow-hidden"
                >
                    <div className="p-4 border-b border-accent-400/10 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                            <History className="w-5 h-5 text-accent-400" />
                            Historique
                        </h3>
                    </div>
                    <div className="divide-y divide-accent-400/5">
                        {orders.length === 0 ? (
                            <div className="p-8 text-center text-dark-400">
                                Aucune commande
                            </div>
                        ) : (
                            orders.slice(0, 5).map((order: any) => (
                                <Link
                                    key={order.id}
                                    href={`/confirmation/${order.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">Commande #{order.order_number}</p>
                                        <p className="text-sm text-dark-400">
                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-accent-400">{formatPrice(order.total)}</span>
                                        <ChevronRight className="w-4 h-4 text-dark-400" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Account Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card overflow-hidden"
                >
                    <button className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-accent-400/5">
                        <User className="w-5 h-5 text-accent-400" />
                        <span>Modifier mon profil</span>
                        <ChevronRight className="w-4 h-4 text-dark-400 ml-auto" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full p-4 flex items-center gap-3 hover:bg-error-500/10 transition-colors text-error-500"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Déconnexion</span>
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
