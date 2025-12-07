/**
 * ProductCard Component
 * Displays a product with image, name, description, price and add to cart button
 * Features Framer Motion animations
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Star } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { formatPrice } from '@/lib/stripe';
import type { Product } from '@/types/database';

interface ProductCardProps {
    product: Product;
    /** Show featured badge */
    showFeatured?: boolean;
    /** Priority loading for above-fold images */
    priority?: boolean;
}

export default function ProductCard({
    product,
    showFeatured = true,
    priority = false
}: ProductCardProps) {
    const { addItem, openCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to product page
        e.stopPropagation();
        addItem(product, 1);
        openCart();
    };

    // Category colors
    const categoryColors: Record<string, string> = {
        burger: 'bg-primary-600/20 text-primary-400',
        pizza: 'bg-orange-600/20 text-orange-400',
        side: 'bg-amber-600/20 text-amber-400',
        drink: 'bg-cyan-600/20 text-cyan-400',
        dessert: 'bg-pink-600/20 text-pink-400',
    };

    const categoryLabels: Record<string, string> = {
        burger: 'Burger',
        pizza: 'Pizza',
        side: 'Accompagnement',
        drink: 'Boisson',
        dessert: 'Dessert',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            data-testid="product-card"
        >
            <Link href={`/menu/${product.id}`} className="block group">
                <div className="card-hover relative overflow-hidden">
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-dark-800">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                priority={priority}
                            />
                        ) : (
                            // Placeholder for products without image
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
                                <span className="text-6xl">
                                    {product.category === 'burger' && '🍔'}
                                    {product.category === 'pizza' && '🍕'}
                                    {product.category === 'side' && '🍟'}
                                    {product.category === 'drink' && '🥤'}
                                    {product.category === 'dessert' && '🍰'}
                                </span>
                            </div>
                        )}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Featured Badge */}
                        {showFeatured && product.is_featured && (
                            <div className="absolute top-3 left-3">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-1 px-2 py-1 bg-accent-400 text-dark-900 text-xs font-bold rounded-full"
                                >
                                    <Star className="w-3 h-3 fill-current" />
                                    Populaire
                                </motion.div>
                            </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[product.category]}`}>
                                {categoryLabels[product.category]}
                            </span>
                        </div>

                        {/* Quick Add Button - Shows on hover */}
                        <motion.button
                            onClick={handleAddToCart}
                            className="absolute bottom-3 right-3 p-3 bg-primary-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary-700 hover:scale-110"
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Ajouter ${product.name} au panier`}
                        >
                            <Plus className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Title */}
                        <h3 className="font-bold text-lg text-white group-hover:text-accent-400 transition-colors line-clamp-1">
                            {product.name}
                        </h3>

                        {/* Description */}
                        {product.description && (
                            <p className="mt-1 text-sm text-dark-400 line-clamp-2">
                                {product.description}
                            </p>
                        )}

                        {/* Price and Add Button */}
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-xl font-bold text-accent-400">
                                {formatPrice(product.price)}
                            </span>

                            <button
                                onClick={handleAddToCart}
                                className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 group-hover:bg-primary-600"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Ajouter
                            </button>
                        </div>
                    </div>

                    {/* Unavailable Overlay */}
                    {!product.is_available && (
                        <div className="absolute inset-0 bg-dark-950/80 flex items-center justify-center">
                            <span className="px-4 py-2 bg-dark-800 text-dark-400 font-semibold rounded-lg">
                                Indisponible
                            </span>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
