/**
 * Navbar Component
 * Responsive navigation with cart and auth state
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    ShoppingCart,
    User,
    LogOut,
    ChefHat,
    Home,
    UtensilsCrossed,
    Phone,
    Clock,
    Info,
    LayoutDashboard
} from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';

// Navigation links
const navLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/about', label: 'À propos', icon: Info },
    { href: '/hours', label: 'Horaires', icon: Clock },
    { href: '/contact', label: 'Contact', icon: Phone },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { itemCount, openCart } = useCart();
    const { user, profile, signOut, loading } = useAuth();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${isScrolled
                        ? 'bg-dark-950/95 backdrop-blur-xl border-b border-white/5 shadow-lg'
                        : 'bg-transparent'
                    }`}
            >
                <nav className="container-custom">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                className="p-2 bg-primary-600 rounded-xl"
                            >
                                <ChefHat className="w-6 h-6 text-white" />
                            </motion.div>
                            <div className="hidden sm:block">
                                <span className="font-display font-bold text-lg text-white group-hover:text-accent-400 transition-colors">
                                    Canadian Burger
                                </span>
                                <span className="block text-xs text-dark-400">& Pizza • Spa</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                                ? 'text-accent-400'
                                                : 'text-dark-300 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {link.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-400 rounded-full"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {/* Cart Button */}
                            <button
                                onClick={openCart}
                                className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
                                aria-label={`Panier (${itemCount} articles)`}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {itemCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                                    >
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </motion.span>
                                )}
                            </button>

                            {/* Auth Actions */}
                            {!loading && (
                                <>
                                    {user ? (
                                        <div className="hidden sm:flex items-center gap-2">
                                            {/* Admin Link */}
                                            {profile?.role === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                                    aria-label="Administration"
                                                >
                                                    <LayoutDashboard className="w-5 h-5 text-accent-400" />
                                                </Link>
                                            )}

                                            {/* Account Link */}
                                            <Link
                                                href="/account"
                                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                                aria-label="Mon compte"
                                            >
                                                <User className="w-5 h-5" />
                                            </Link>

                                            {/* Sign Out */}
                                            <button
                                                onClick={() => signOut()}
                                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-dark-400 hover:text-white"
                                                aria-label="Déconnexion"
                                            >
                                                <LogOut className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="hidden sm:flex btn-primary btn-sm"
                                        >
                                            Connexion
                                        </Link>
                                    )}
                                </>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                                aria-label="Menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 md:hidden"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-80 max-w-[80vw] bg-dark-900 border-r border-white/10 z-50 md:hidden"
                        >
                            {/* Menu Header */}
                            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                                <div className="p-2 bg-primary-600 rounded-xl">
                                    <ChefHat className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className="font-display font-bold text-lg">Canadian Burger</span>
                                    <span className="block text-xs text-dark-400">& Pizza • Spa</span>
                                </div>
                            </div>

                            {/* Menu Links */}
                            <nav className="p-4">
                                <ul className="space-y-1">
                                    {navLinks.map((link) => {
                                        const isActive = pathname === link.href;
                                        const Icon = link.icon;
                                        return (
                                            <li key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                            ? 'bg-primary-600/20 text-primary-400'
                                                            : 'text-dark-300 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    {link.label}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {/* Mobile Auth */}
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    {user ? (
                                        <div className="space-y-1">
                                            <Link
                                                href="/account"
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark-300 hover:bg-white/5 hover:text-white transition-colors"
                                            >
                                                <User className="w-5 h-5" />
                                                Mon compte
                                            </Link>
                                            {profile?.role === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-accent-400 hover:bg-white/5 transition-colors"
                                                >
                                                    <LayoutDashboard className="w-5 h-5" />
                                                    Administration
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => signOut()}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark-400 hover:bg-white/5 hover:text-primary-400 transition-colors w-full"
                                            >
                                                <LogOut className="w-5 h-5" />
                                                Déconnexion
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Link href="/login" className="btn-primary w-full justify-center">
                                                Connexion
                                            </Link>
                                            <Link href="/register" className="btn-outline w-full justify-center">
                                                Créer un compte
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
