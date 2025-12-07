/**
 * Add to Cart Button - Client component for product page
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import type { Product } from '@/types/database';

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const { addItem, openCart } = useCart();

    const handleAddToCart = () => {
        addItem(product, quantity);
        setAdded(true);

        setTimeout(() => {
            setAdded(false);
            openCart();
        }, 1000);
    };

    const incrementQuantity = () => {
        if (quantity < 20) setQuantity(q => q + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) setQuantity(q => q - 1);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center bg-dark-800 rounded-xl">
                <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-4 hover:bg-dark-700 rounded-l-xl transition-colors disabled:opacity-50"
                    aria-label="Réduire la quantité"
                >
                    <Minus className="w-5 h-5" />
                </button>
                <span className="w-16 text-center text-lg font-bold">
                    {quantity}
                </span>
                <button
                    onClick={incrementQuantity}
                    disabled={quantity >= 20}
                    className="p-4 hover:bg-dark-700 rounded-r-xl transition-colors disabled:opacity-50"
                    aria-label="Augmenter la quantité"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Add Button */}
            <motion.button
                onClick={handleAddToCart}
                disabled={!product.is_available || added}
                className={`flex-1 btn-accent btn-lg justify-center ${added ? 'bg-success-500 hover:bg-success-500' : ''
                    }`}
                whileTap={{ scale: 0.95 }}
            >
                {added ? (
                    <>
                        <Check className="w-5 h-5" />
                        Ajouté!
                    </>
                ) : (
                    <>
                        <ShoppingCart className="w-5 h-5" />
                        Ajouter au panier
                    </>
                )}
            </motion.button>
        </div>
    );
}
