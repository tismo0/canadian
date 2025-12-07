/**
 * Admin Dashboard
 * Main admin panel with orders, announcements, and navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    Megaphone,
    QrCode,
    Users,
    Settings,
    LogOut,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Trash2,
    ChefHat,
    Menu,
    X
} from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';
import type { Order, OrderStatus } from '@/types/database';

// Announcement type
interface Announcement {
    id: string;
    text: string;
    active: boolean;
    createdAt: Date;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState('orders');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [newAnnouncement, setNewAnnouncement] = useState('');
    const supabase = createBrowserSupabaseClient();

    // Check authentication
    useEffect(() => {
        const isAdmin = localStorage.getItem('admin_authenticated') === 'true';
        if (!isAdmin) {
            router.push('/admin/login');
        } else {
            setIsAuthenticated(true);
            fetchOrders();
            loadAnnouncements();
        }
    }, [router]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('orders')
                .select('*, items:order_items(*)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setOrders(data);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
        setLoading(false);
    };

    const loadAnnouncements = () => {
        const saved = localStorage.getItem('admin_announcements');
        if (saved) {
            setAnnouncements(JSON.parse(saved));
        }
    };

    const saveAnnouncements = (updated: Announcement[]) => {
        localStorage.setItem('admin_announcements', JSON.stringify(updated));
        setAnnouncements(updated);
    };

    const addAnnouncement = () => {
        if (!newAnnouncement.trim()) return;
        const updated = [
            ...announcements,
            {
                id: Date.now().toString(),
                text: newAnnouncement,
                active: true,
                createdAt: new Date()
            }
        ];
        saveAnnouncements(updated);
        setNewAnnouncement('');
    };

    const deleteAnnouncement = (id: string) => {
        const updated = announcements.filter(a => a.id !== id);
        saveAnnouncements(updated);
    };

    const toggleAnnouncement = (id: string) => {
        const updated = announcements.map(a =>
            a.id === id ? { ...a, active: !a.active } : a
        );
        saveAnnouncements(updated);
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

    const handleLogout = () => {
        localStorage.removeItem('admin_authenticated');
        document.cookie = 'admin_session=; path=/; max-age=0';
        router.push('/admin/login');
    };

    // Stats
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending' || o.status === 'paid').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        revenue: orders
            .filter(o => o.payment_status === 'succeeded')
            .reduce((sum, o) => sum + o.total, 0)
    };

    const statusConfig: Record<OrderStatus, { label: string; color: string; next?: OrderStatus }> = {
        pending: { label: 'En attente', color: 'status-pending', next: 'paid' },
        paid: { label: 'Payée', color: 'status-paid', next: 'preparing' },
        preparing: { label: 'En préparation', color: 'status-preparing', next: 'ready' },
        ready: { label: 'Prête', color: 'status-ready', next: 'completed' },
        completed: { label: 'Terminée', color: 'status-completed' },
        cancelled: { label: 'Annulée', color: 'status-cancelled' },
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const navItems = [
        { id: 'orders', label: 'Commandes', icon: Package },
        { id: 'announcements', label: 'Annonces', icon: Megaphone },
        { id: 'scanner', label: 'Scanner QR', icon: QrCode },
        { id: 'customers', label: 'Clients', icon: Users },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 admin-sidebar transform transition-transform duration-300 lg:translate-x-0 lg:static
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-accent-400/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                                <ChefHat className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-cream">Admin</h2>
                                <p className="text-xs text-dark-400">Canadian B&P</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                className={`admin-nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-accent-400/10">
                        <button
                            onClick={handleLogout}
                            className="admin-nav-item w-full text-error-500 hover:bg-error-500/10"
                        >
                            <LogOut className="w-5 h-5" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 glass border-b border-accent-400/10 px-4 py-4 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl font-bold">
                                {navItems.find(n => n.id === activeTab)?.label}
                            </h1>
                        </div>
                        <button
                            onClick={fetchOrders}
                            className="btn btn-outline btn-sm"
                        >
                            Actualiser
                        </button>
                    </div>
                </header>

                <div className="p-4 lg:p-8">
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="card p-4">
                                    <Package className="w-8 h-8 text-accent-400 mb-2" />
                                    <p className="text-3xl font-bold">{stats.total}</p>
                                    <p className="text-sm text-dark-400">Commandes</p>
                                </div>
                                <div className="card p-4">
                                    <Clock className="w-8 h-8 text-warning-500 mb-2" />
                                    <p className="text-3xl font-bold">{stats.pending + stats.preparing}</p>
                                    <p className="text-sm text-dark-400">En cours</p>
                                </div>
                                <div className="card p-4">
                                    <AlertCircle className="w-8 h-8 text-success-500 mb-2" />
                                    <p className="text-3xl font-bold">{stats.ready}</p>
                                    <p className="text-sm text-dark-400">Prêtes</p>
                                </div>
                                <div className="card p-4">
                                    <TrendingUp className="w-8 h-8 text-primary-400 mb-2" />
                                    <p className="text-3xl font-bold">{formatPrice(stats.revenue)}</p>
                                    <p className="text-sm text-dark-400">Revenus</p>
                                </div>
                            </div>

                            {/* Orders List */}
                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-dark-900/50 border-b border-accent-400/10">
                                            <tr>
                                                <th className="text-left p-4 text-sm font-medium text-dark-400">N°</th>
                                                <th className="text-left p-4 text-sm font-medium text-dark-400">Client</th>
                                                <th className="text-left p-4 text-sm font-medium text-dark-400">Total</th>
                                                <th className="text-left p-4 text-sm font-medium text-dark-400">Statut</th>
                                                <th className="text-left p-4 text-sm font-medium text-dark-400">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-accent-400/5">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center">
                                                        <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin mx-auto" />
                                                    </td>
                                                </tr>
                                            ) : orders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-dark-400">
                                                        Aucune commande
                                                    </td>
                                                </tr>
                                            ) : (
                                                orders.map((order) => {
                                                    const config = statusConfig[order.status];
                                                    return (
                                                        <tr key={order.id} className="hover:bg-white/5">
                                                            <td className="p-4">
                                                                <span className="font-bold">#{order.order_number}</span>
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="font-medium">{order.customer_name}</p>
                                                                <p className="text-sm text-dark-400">{order.customer_phone}</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="font-bold text-accent-400">{formatPrice(order.total)}</span>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`badge ${config.color}`}>
                                                                    {config.label}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                {config.next && (
                                                                    <button
                                                                        onClick={() => updateOrderStatus(order.id, config.next!)}
                                                                        className="btn btn-sm btn-primary"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        Avancer
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Announcements Tab */}
                    {activeTab === 'announcements' && (
                        <div className="space-y-6">
                            {/* Add Announcement */}
                            <div className="card p-6">
                                <h3 className="text-lg font-bold mb-4">Nouvelle annonce</h3>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={newAnnouncement}
                                        onChange={(e) => setNewAnnouncement(e.target.value)}
                                        placeholder="Ex: Promotion -20% sur les pizzas ce weekend !"
                                        className="input flex-1"
                                    />
                                    <button
                                        onClick={addAnnouncement}
                                        className="btn btn-accent"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Ajouter
                                    </button>
                                </div>
                            </div>

                            {/* Announcements List */}
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {announcements.map((announcement) => (
                                        <motion.div
                                            key={announcement.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="card p-4 flex items-center gap-4"
                                        >
                                            <button
                                                onClick={() => toggleAnnouncement(announcement.id)}
                                                className={`w-12 h-6 rounded-full transition-colors ${announcement.active ? 'bg-success-500' : 'bg-dark-600'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${announcement.active ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`} />
                                            </button>
                                            <p className={`flex-1 ${!announcement.active ? 'text-dark-400 line-through' : ''}`}>
                                                {announcement.text}
                                            </p>
                                            <button
                                                onClick={() => deleteAnnouncement(announcement.id)}
                                                className="p-2 text-error-500 hover:bg-error-500/20 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {announcements.length === 0 && (
                                    <div className="text-center py-12 text-dark-400">
                                        <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Aucune annonce</p>
                                    </div>
                                )}
                            </div>

                            {/* Preview */}
                            {announcements.filter(a => a.active).length > 0 && (
                                <div className="card p-6">
                                    <h3 className="text-lg font-bold mb-4">Aperçu du bandeau</h3>
                                    <div className="announcement-bar py-3 rounded-lg overflow-hidden">
                                        <div className="announcement-scroll whitespace-nowrap">
                                            {[...announcements.filter(a => a.active), ...announcements.filter(a => a.active)].map((a, i) => (
                                                <span key={i} className="mx-8 inline-flex items-center gap-2">
                                                    <span className="text-accent-400">★</span>
                                                    {a.text}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scanner Tab */}
                    {activeTab === 'scanner' && (
                        <div className="max-w-lg mx-auto">
                            <div className="card p-8 text-center">
                                <QrCode className="w-16 h-16 text-accent-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Scanner QR Code</h3>
                                <p className="text-dark-400 mb-6">
                                    Scannez le QR code d&apos;une commande ou d&apos;un client pour ajouter des points fidélité
                                </p>
                                <Link href="/admin/scan" className="btn btn-accent">
                                    Ouvrir le scanner
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Customers Tab */}
                    {activeTab === 'customers' && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-accent-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Gestion des clients</h3>
                            <p className="text-dark-400">Fonctionnalité à venir</p>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="max-w-lg mx-auto">
                            <div className="card p-6 space-y-4">
                                <h3 className="text-lg font-bold">Paramètres</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-2">Nom du restaurant</label>
                                        <input type="text" defaultValue="Canadian Burger & Pizza" className="input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-2">Points par euro</label>
                                        <input type="number" defaultValue={1} className="input" />
                                    </div>
                                    <button className="btn btn-accent w-full">
                                        Enregistrer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
