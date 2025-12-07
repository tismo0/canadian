/**
 * Cart Component
 * Modern slide-out cart drawer with white theme
 */

'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { formatPrice } from '@/lib/stripe';

export default function Cart() {
    const {
        items,
        isOpen,
        closeCart,
        removeItem,
        updateQuantity,
        subtotal,
        itemCount,
        clearCart
    } = useCart();

    // Category emojis
    const categoryEmojis: Record<string, string> = {
        burger: '🍔',
        pizza: '🍕',
        side: '🍟',
        drink: '🥤',
        dessert: '🍰',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        data-testid="cart-backdrop"
                    />

                    {/* Cart Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                        data-testid="cart-drawer"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg text-neutral-900">Mon Panier</h2>
                                    <p className="text-sm text-neutral-500">
                                        {itemCount} {itemCount === 1 ? 'article' : 'articles'}
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                onClick={closeCart}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                aria-label="Fermer le panier"
                            >
                                <X className="w-5 h-5 text-neutral-500" />
                            </motion.button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-24 h-24 mb-4 rounded-full bg-neutral-100 flex items-center justify-center"
                                    >
                                        <ShoppingBag className="w-12 h-12 text-neutral-300" />
                                    </motion.div>
                                    <h3 className="font-semibold text-lg text-neutral-900 mb-2">Votre panier est vide</h3>
                                    <p className="text-neutral-500 mb-6 text-sm">
                                        Ajoutez des articles depuis notre menu
                                    </p>
                                    <Link
                                        href="/menu"
                                        onClick={closeCart}
                                        className="btn-primary"
                                    >
                                        Voir le menu
                                    </Link>
                                </div>
                            ) : (
                                <ul className="space-y-3" data-testid="cart-items">
                                    <AnimatePresence mode="popLayout">
                                        {items.map((item) => (
                                            <motion.li
                                                key={item.product.id}
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20, height: 0 }}
                                                className="flex gap-3 p-3 bg-neutral-50 rounded-xl"
                                                data-testid={`cart-item-${item.product.id}`}
                                            >
                                                {/* Product Image */}
                                                <div className="relative w-18 h-18 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                                                    {item.product.image_url ? (
                                                        <Image
                                                            src={item.product.image_url}
                                                            alt={item.product.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="72px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                                            {categoryEmojis[item.product.category] || '🍽️'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm text-neutral-900 line-clamp-1">
                                                        {item.product.name}
                                                    </h4>
                                                    <p className="text-primary-600 font-semibold text-sm mt-0.5">
                                                        {formatPrice(item.product.price)}
                                                    </p>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex items-center bg-white border border-neutral-200 rounded-lg">
                                                            <button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                                className="p-1.5 hover:bg-neutral-50 rounded-l-lg transition-colors"
                                                                aria-label="Réduire la quantité"
                                                            >
                                                                <Minus className="w-3.5 h-3.5 text-neutral-600" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium text-neutral-900" data-testid="item-quantity">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                                className="p-1.5 hover:bg-neutral-50 rounded-r-lg transition-colors"
                                                                aria-label="Augmenter la quantité"
                                                            >
                                                                <Plus className="w-3.5 h-3.5 text-neutral-600" />
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => removeItem(item.product.id)}
                                                            className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors ml-auto"
                                                            aria-label="Supprimer l'article"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Item Total */}
                                                <div className="text-right self-center">
                                                    <span className="font-bold text-neutral-900">
                                                        {formatPrice(item.product.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            )}
                        </div>

                        {/* Footer - Totals & Checkout */}
                        {items.length > 0 && (
                            <div className="border-t border-neutral-100 p-4 space-y-4 bg-white">
                                {/* Clear Cart */}
                                <button
                                    onClick={clearCart}
                                    className="w-full text-center text-sm text-neutral-400 hover:text-primary-600 transition-colors"
                                >
                                    Vider le panier
                                </button>

                                {/* Subtotal */}
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-600">Sous-total</span>
                                    <span className="text-xl font-bold text-neutral-900" data-testid="cart-subtotal">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>

                                {/* Checkout Buttons */}
                                <div className="space-y-2">
                                    <Link
                                        href="/cart"
                                        onClick={closeCart}
                                        className="btn-secondary w-full justify-center"
                                    >
                                        Voir le panier
                                    </Link>

                                    <Link
                                        href="/checkout"
                                        onClick={closeCart}
                                        className="btn-accent w-full justify-center"
                                    >
                                        Commander
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </Fragment>
            )}
        </AnimatePresence>
    );
}
