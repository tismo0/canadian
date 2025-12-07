/**
 * Cart Component
 * Slide-out cart drawer with items, quantities, and checkout button
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

    return (
        <AnimatePresence>
            {isOpen && (
                <Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40"
                        data-testid="cart-backdrop"
                    />

                    {/* Cart Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-dark-900 border-l border-white/10 z-50 flex flex-col"
                        data-testid="cart-drawer"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-600/20 rounded-lg">
                                    <ShoppingBag className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">Mon Panier</h2>
                                    <p className="text-sm text-dark-400">
                                        {itemCount} {itemCount === 1 ? 'article' : 'articles'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={closeCart}
                                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                                aria-label="Fermer le panier"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-24 h-24 mb-4 rounded-full bg-dark-800 flex items-center justify-center"
                                    >
                                        <ShoppingBag className="w-12 h-12 text-dark-600" />
                                    </motion.div>
                                    <h3 className="font-semibold text-lg mb-2">Votre panier est vide</h3>
                                    <p className="text-dark-400 mb-6">
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
                                <ul className="space-y-4" data-testid="cart-items">
                                    <AnimatePresence mode="popLayout">
                                        {items.map((item) => (
                                            <motion.li
                                                key={item.product.id}
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20, height: 0 }}
                                                className="flex gap-4 p-3 bg-dark-800/50 rounded-xl"
                                                data-testid={`cart-item-${item.product.id}`}
                                            >
                                                {/* Product Image */}
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
                                                    {item.product.image_url ? (
                                                        <Image
                                                            src={item.product.image_url}
                                                            alt={item.product.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="80px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                                            {item.product.category === 'burger' && '🍔'}
                                                            {item.product.category === 'pizza' && '🍕'}
                                                            {item.product.category === 'side' && '🍟'}
                                                            {item.product.category === 'drink' && '🥤'}
                                                            {item.product.category === 'dessert' && '🍰'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm line-clamp-1">
                                                        {item.product.name}
                                                    </h4>
                                                    <p className="text-accent-400 font-bold text-sm mt-1">
                                                        {formatPrice(item.product.price)}
                                                    </p>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex items-center bg-dark-900 rounded-lg">
                                                            <button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                                className="p-1.5 hover:bg-dark-700 rounded-l-lg transition-colors"
                                                                aria-label="Réduire la quantité"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-semibold" data-testid="item-quantity">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                                className="p-1.5 hover:bg-dark-700 rounded-r-lg transition-colors"
                                                                aria-label="Augmenter la quantité"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => removeItem(item.product.id)}
                                                            className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-dark-900 rounded-lg transition-colors ml-auto"
                                                            aria-label="Supprimer l'article"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Item Total */}
                                                <div className="text-right">
                                                    <span className="font-bold">
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
                            <div className="border-t border-white/10 p-4 space-y-4">
                                {/* Clear Cart */}
                                <button
                                    onClick={clearCart}
                                    className="w-full text-center text-sm text-dark-400 hover:text-primary-400 transition-colors"
                                >
                                    Vider le panier
                                </button>

                                {/* Subtotal */}
                                <div className="flex items-center justify-between text-lg">
                                    <span className="text-dark-300">Sous-total</span>
                                    <span className="font-bold text-accent-400" data-testid="cart-subtotal">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>

                                {/* Checkout Button */}
                                <Link
                                    href="/cart"
                                    onClick={closeCart}
                                    className="btn-primary w-full justify-center text-center"
                                >
                                    Voir le panier
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    className="btn-accent w-full justify-center text-center"
                                >
                                    Commander
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </Fragment>
            )}
        </AnimatePresence>
    );
}
