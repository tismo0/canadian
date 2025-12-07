/**
 * Navbar Component
 * Modern, clean navigation with light theme
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
    Home,
    UtensilsCrossed,
    Phone,
    Clock,
    Info,
    LayoutDashboard,
    ChevronRight
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

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${isScrolled
                        ? 'bg-white/95 backdrop-blur-md shadow-md'
                        : 'bg-transparent'
                    }`}
            >
                <nav className="container-custom">
                    <div className="flex items-center justify-between h-16 md:h-18">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-red"
                            >
                                <span className="text-white text-xl font-bold">CB</span>
                            </motion.div>
                            <div className="hidden sm:block">
                                <span className={`font-display text-xl tracking-wide ${isScrolled ? 'text-neutral-900' : 'text-neutral-900'
                                    }`}>
                                    CANADIAN BURGER
                                </span>
                                <span className={`block text-xs font-medium -mt-1 ${isScrolled ? 'text-neutral-500' : 'text-neutral-500'
                                    }`}>& Pizza • Spa</span>
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
                                        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                                ? 'text-primary-600'
                                                : isScrolled
                                                    ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                                            }`}
                                    >
                                        {link.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary-600 rounded-full"
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {/* Cart Button */}
                            <motion.button
                                onClick={openCart}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative p-2.5 rounded-xl transition-colors ${isScrolled
                                        ? 'hover:bg-neutral-100 text-neutral-700'
                                        : 'hover:bg-white/50 text-neutral-700'
                                    }`}
                                aria-label={`Panier (${itemCount} articles)`}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <AnimatePresence>
                                    {itemCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-accent-400 text-neutral-900 text-xs font-bold rounded-full flex items-center justify-center shadow-yellow"
                                        >
                                            {itemCount > 99 ? '99+' : itemCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* Auth Actions */}
                            {!loading && (
                                <>
                                    {user ? (
                                        <div className="hidden sm:flex items-center gap-1">
                                            {/* Admin Link */}
                                            {profile?.role === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    className={`p-2.5 rounded-xl transition-colors ${isScrolled
                                                            ? 'hover:bg-neutral-100 text-primary-600'
                                                            : 'hover:bg-white/50 text-primary-600'
                                                        }`}
                                                    aria-label="Administration"
                                                >
                                                    <LayoutDashboard className="w-5 h-5" />
                                                </Link>
                                            )}

                                            {/* Account Link */}
                                            <Link
                                                href="/account"
                                                className={`p-2.5 rounded-xl transition-colors ${isScrolled
                                                        ? 'hover:bg-neutral-100 text-neutral-700'
                                                        : 'hover:bg-white/50 text-neutral-700'
                                                    }`}
                                                aria-label="Mon compte"
                                            >
                                                <User className="w-5 h-5" />
                                            </Link>

                                            {/* Sign Out */}
                                            <button
                                                onClick={() => signOut()}
                                                className={`p-2.5 rounded-xl transition-colors ${isScrolled
                                                        ? 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
                                                        : 'hover:bg-white/50 text-neutral-500 hover:text-neutral-700'
                                                    }`}
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
                            <motion.button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`md:hidden p-2.5 rounded-xl transition-colors ${isScrolled
                                        ? 'hover:bg-neutral-100 text-neutral-700'
                                        : 'hover:bg-white/50 text-neutral-700'
                                    }`}
                                aria-label="Menu"
                            >
                                <AnimatePresence mode="wait">
                                    {isMobileMenuOpen ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <X className="w-6 h-6" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <Menu className="w-6 h-6" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
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
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                        />

                        {/* Menu Panel - Slide from right */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden"
                        >
                            {/* Menu Header */}
                            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                        <span className="text-white text-xl font-bold">CB</span>
                                    </div>
                                    <div>
                                        <span className="font-display text-lg tracking-wide text-neutral-900">
                                            CANADIAN BURGER
                                        </span>
                                        <span className="block text-xs text-neutral-500 -mt-0.5">& Pizza • Spa</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-neutral-500" />
                                </button>
                            </div>

                            {/* Menu Links */}
                            <nav className="p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
                                <ul className="space-y-1">
                                    {navLinks.map((link, index) => {
                                        const isActive = pathname === link.href;
                                        const Icon = link.icon;
                                        return (
                                            <motion.li
                                                key={link.href}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive
                                                            ? 'bg-primary-50 text-primary-600'
                                                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="w-5 h-5" />
                                                        <span className="font-medium">{link.label}</span>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-neutral-300'}`} />
                                                </Link>
                                            </motion.li>
                                        );
                                    })}
                                </ul>

                                {/* Mobile Auth */}
                                <div className="mt-6 pt-6 border-t border-neutral-100">
                                    {user ? (
                                        <div className="space-y-1">
                                            <Link
                                                href="/account"
                                                className="flex items-center justify-between px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <User className="w-5 h-5" />
                                                    <span className="font-medium">Mon compte</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-neutral-300" />
                                            </Link>
                                            {profile?.role === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center justify-between px-4 py-3 rounded-xl text-primary-600 hover:bg-primary-50 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <LayoutDashboard className="w-5 h-5" />
                                                        <span className="font-medium">Administration</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-primary-300" />
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => signOut()}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-neutral-50 hover:text-primary-600 transition-all"
                                            >
                                                <LogOut className="w-5 h-5" />
                                                <span className="font-medium">Déconnexion</span>
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
