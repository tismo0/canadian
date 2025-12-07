/**
 * Cart Page
 * Modern cart view with light theme
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { formatPrice } from '@/lib/stripe';

// Category emojis
const categoryEmojis: Record<string, string> = {
    burger: '🍔',
    pizza: '🍕',
    side: '🍟',
    drink: '🥤',
    dessert: '🍰',
};

export default function CartPage() {
    const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-neutral-50">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 mb-6 rounded-full bg-neutral-100 flex items-center justify-center"
                >
                    <ShoppingBag className="w-12 h-12 text-neutral-300" />
                </motion.div>
                <h1 className="text-2xl text-neutral-900 mb-2">VOTRE PANIER EST VIDE</h1>
                <p className="text-neutral-500 mb-8 max-w-md">
                    Parcourez notre menu et ajoutez vos produits préférés pour commencer votre commande.
                </p>
                <Link href="/menu" className="btn-primary">
                    Voir le menu
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <section className="bg-white border-b border-neutral-100">
                <div className="container-custom py-8">
                    <Link
                        href="/menu"
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Continuer mes achats
                    </Link>
                    <h1 className="text-neutral-900">MON PANIER</h1>
                    <p className="text-neutral-500 mt-1">
                        {itemCount} {itemCount === 1 ? 'article' : 'articles'}
                    </p>
                </div>
            </section>

            {/* Cart Content */}
            <section className="section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.product.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="card bg-white p-4 md:p-6"
                                    >
                                        <div className="flex gap-4 md:gap-6">
                                            {/* Image */}
                                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                                                {item.product.image_url ? (
                                                    <Image
                                                        src={item.product.image_url}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="128px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                                        {categoryEmojis[item.product.category] || '🍽️'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-neutral-900" style={{ fontFamily: 'Poppins, sans-serif', textTransform: 'none' }}>
                                                            {item.product.name}
                                                        </h3>
                                                        <p className="text-primary-600 font-semibold mt-1">
                                                            {formatPrice(item.product.price)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.product.id)}
                                                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                        aria-label="Supprimer"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Quantity & Total */}
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center bg-neutral-100 rounded-lg">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                            className="p-2 hover:bg-neutral-200 rounded-l-lg transition-colors"
                                                            aria-label="Réduire"
                                                        >
                                                            <Minus className="w-4 h-4 text-neutral-600" />
                                                        </button>
                                                        <span className="w-10 text-center font-semibold text-neutral-900">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            className="p-2 hover:bg-neutral-200 rounded-r-lg transition-colors"
                                                            aria-label="Augmenter"
                                                        >
                                                            <Plus className="w-4 h-4 text-neutral-600" />
                                                        </button>
                                                    </div>

                                                    <span className="font-bold text-lg text-neutral-900">
                                                        {formatPrice(item.product.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Clear Cart */}
                            <button
                                onClick={clearCart}
                                className="text-neutral-400 hover:text-primary-600 text-sm transition-colors"
                            >
                                Vider le panier
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="card bg-white p-6 sticky top-24">
                                <h2 className="font-semibold text-xl text-neutral-900 mb-6" style={{ fontFamily: 'Poppins, sans-serif', textTransform: 'none' }}>
                                    Récapitulatif
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Sous-total</span>
                                        <span className="text-neutral-900">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Frais de service</span>
                                        <span className="text-green-600 font-medium">Gratuit</span>
                                    </div>
                                    <div className="border-t border-neutral-100 pt-4 flex justify-between text-xl font-bold">
                                        <span className="text-neutral-900">Total</span>
                                        <span className="text-primary-600">{formatPrice(subtotal)}</span>
                                    </div>
                                </div>

                                <Link href="/checkout" className="btn-accent w-full justify-center">
                                    Passer la commande
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <p className="text-xs text-neutral-400 text-center mt-4">
                                    Paiement sécurisé par Stripe
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
