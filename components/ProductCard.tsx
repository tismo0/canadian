/**
 * ProductCard Component
 * Premium product card with smooth animations
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Star, Eye } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { formatPrice } from '@/lib/stripe';
import type { Product } from '@/types/database';

interface ProductCardProps {
    product: Product;
    showFeatured?: boolean;
    priority?: boolean;
}

export default function ProductCard({
    product,
    showFeatured = true,
    priority = false
}: ProductCardProps) {
    const { addItem, openCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1);
        openCart();
    };

    // Category styling
    const categoryStyles: Record<string, { bg: string; text: string; emoji: string }> = {
        burger: { bg: 'bg-primary-100', text: 'text-primary-700', emoji: '🍔' },
        pizza: { bg: 'bg-orange-100', text: 'text-orange-700', emoji: '🍕' },
        side: { bg: 'bg-amber-100', text: 'text-amber-700', emoji: '🍟' },
        drink: { bg: 'bg-cyan-100', text: 'text-cyan-700', emoji: '🥤' },
        dessert: { bg: 'bg-pink-100', text: 'text-pink-700', emoji: '🍰' },
    };

    const categoryLabels: Record<string, string> = {
        burger: 'Burger',
        pizza: 'Pizza',
        side: 'Accompagnement',
        drink: 'Boisson',
        dessert: 'Dessert',
    };

    const style = categoryStyles[product.category] || categoryStyles.burger;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            data-testid="product-card"
        >
            <Link href={`/menu/${product.id}`} className="block group">
                <div className="product-card relative">
                    {/* Image Container */}
                    <div className="product-card-image relative aspect-[4/3] overflow-hidden bg-neutral-100">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                priority={priority}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
                                <span className="text-6xl">{style.emoji}</span>
                            </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Featured Badge */}
                        {showFeatured && product.is_featured && (
                            <motion.div
                                initial={{ scale: 0, rotate: -12 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute top-3 left-3"
                            >
                                <div className="flex items-center gap-1 px-2.5 py-1 bg-accent-400 text-neutral-900 text-xs font-semibold rounded-full shadow-yellow">
                                    <Star className="w-3 h-3 fill-current" />
                                    Best-seller
                                </div>
                            </motion.div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
                                {categoryLabels[product.category]}
                            </span>
                        </div>

                        {/* Price Badge */}
                        <div className="product-card-price">
                            {formatPrice(product.price)}
                        </div>

                        {/* Quick Actions - Show on hover */}
                        <div className="absolute bottom-3 left-3 right-16 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                            <motion.button
                                onClick={handleAddToCart}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter
                            </motion.button>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur text-neutral-700 text-sm font-medium rounded-lg shadow-lg"
                            >
                                <Eye className="w-4 h-4" />
                                Voir
                            </motion.div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Title */}
                        <h3 className="font-semibold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                            {product.name}
                        </h3>

                        {/* Description */}
                        {product.description && (
                            <p className="mt-1.5 text-sm text-neutral-500 line-clamp-2 leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* Price and Add Button - Mobile visible */}
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-xl font-bold text-primary-600">
                                {formatPrice(product.price)}
                            </span>

                            <button
                                onClick={handleAddToCart}
                                className="flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-primary-600 text-neutral-700 hover:text-white text-sm font-medium rounded-lg transition-all duration-200 md:opacity-100 group-hover:bg-primary-600 group-hover:text-white"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span className="hidden sm:inline">Ajouter</span>
                            </button>
                        </div>
                    </div>

                    {/* Unavailable Overlay */}
                    {!product.is_available && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-xl">
                            <span className="px-4 py-2 bg-neutral-100 text-neutral-500 font-medium rounded-lg">
                                Indisponible
                            </span>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
