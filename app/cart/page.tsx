/**
 * Cart Page
 * Full cart view with items management
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { formatPrice } from '@/lib/stripe';

export default function CartPage() {
    const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 mb-6 rounded-full bg-dark-800 flex items-center justify-center"
                >
                    <ShoppingBag className="w-12 h-12 text-dark-600" />
                </motion.div>
                <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
                <p className="text-dark-400 mb-8 max-w-md">
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
        <div className="min-h-screen">
            {/* Header */}
            <section className="bg-dark-900/50 border-b border-white/5">
                <div className="container-custom py-8">
                    <Link
                        href="/menu"
                        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Continuer mes achats
                    </Link>
                    <h1 className="text-3xl font-bold">Mon Panier</h1>
                    <p className="text-dark-400 mt-1">
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
                                        className="card p-4 md:p-6"
                                    >
                                        <div className="flex gap-4 md:gap-6">
                                            {/* Image */}
                                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0">
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
                                                        {item.product.category === 'burger' && '🍔'}
                                                        {item.product.category === 'pizza' && '🍕'}
                                                        {item.product.category === 'side' && '🍟'}
                                                        {item.product.category === 'drink' && '🥤'}
                                                        {item.product.category === 'dessert' && '🍰'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg">{item.product.name}</h3>
                                                        <p className="text-accent-400 font-semibold mt-1">
                                                            {formatPrice(item.product.price)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.product.id)}
                                                        className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-800 rounded-lg transition-colors"
                                                        aria-label="Supprimer"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Quantity & Total */}
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center bg-dark-800 rounded-lg">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                            className="p-2 hover:bg-dark-700 rounded-l-lg transition-colors"
                                                            aria-label="Réduire"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-10 text-center font-semibold">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            className="p-2 hover:bg-dark-700 rounded-r-lg transition-colors"
                                                            aria-label="Augmenter"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <span className="font-bold text-lg">
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
                                className="text-dark-400 hover:text-primary-400 text-sm transition-colors"
                            >
                                Vider le panier
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="card p-6 sticky top-24">
                                <h2 className="font-bold text-xl mb-6">Récapitulatif</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-dark-300">
                                        <span>Sous-total</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-dark-300">
                                        <span>Frais de service</span>
                                        <span className="text-success-500">Gratuit</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span className="text-accent-400">{formatPrice(subtotal)}</span>
                                    </div>
                                </div>

                                <Link href="/checkout" className="btn-accent w-full justify-center">
                                    Passer la commande
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <p className="text-xs text-dark-500 text-center mt-4">
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
