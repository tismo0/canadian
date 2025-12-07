/**
 * Product Detail Page
 * Shows full product info with add to cart
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingCart, Star, Clock } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';
import AddToCartButton from './AddToCartButton';

// Revalidate every 5 minutes
export const revalidate = 300;

// Generate metadata
export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: product } = await supabase
        .from('products')
        .select('name, description')
        .eq('id', id)
        .single();

    if (!product) {
        return { title: 'Produit non trouvé' };
    }

    return {
        title: product.name,
        description: product.description || `Découvrez ${product.name} chez Canadian Burger & Pizza`,
    };
}

async function getProduct(id: string) {
    const supabase = await createServerSupabaseClient();

    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        return null;
    }

    return product;
}

async function getRelatedProducts(category: string, excludeId: string) {
    const supabase = await createServerSupabaseClient();

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_available', true)
        .neq('id', excludeId)
        .limit(3);

    return products || [];
}

export default async function ProductPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.category, product.id);

    const categoryLabels: Record<string, string> = {
        burger: 'Burger',
        pizza: 'Pizza',
        side: 'Accompagnement',
        drink: 'Boisson',
        dessert: 'Dessert',
    };

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-dark-900/50 border-b border-white/5">
                <div className="container-custom py-4">
                    <Link
                        href="/menu"
                        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour au menu
                    </Link>
                </div>
            </div>

            {/* Product Detail */}
            <section className="section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Image */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-800">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-9xl">
                                    {product.category === 'burger' && '🍔'}
                                    {product.category === 'pizza' && '🍕'}
                                    {product.category === 'side' && '🍟'}
                                    {product.category === 'drink' && '🥤'}
                                    {product.category === 'dessert' && '🍰'}
                                </div>
                            )}

                            {/* Featured badge */}
                            {product.is_featured && (
                                <div className="absolute top-4 left-4">
                                    <span className="flex items-center gap-1 px-3 py-1 bg-accent-400 text-dark-900 text-sm font-bold rounded-full">
                                        <Star className="w-4 h-4 fill-current" />
                                        Populaire
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col">
                            {/* Category */}
                            <span className="badge-primary w-fit mb-4">
                                {categoryLabels[product.category]}
                            </span>

                            {/* Name */}
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                                {product.name}
                            </h1>

                            {/* Description */}
                            {product.description && (
                                <p className="text-lg text-dark-300 mb-6">
                                    {product.description}
                                </p>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-4xl font-bold text-accent-400">
                                    {formatPrice(product.price)}
                                </span>
                            </div>

                            {/* Add to cart */}
                            <AddToCartButton product={product} />

                            {/* Info cards */}
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="card p-4">
                                    <Clock className="w-5 h-5 text-accent-400 mb-2" />
                                    <p className="text-sm text-dark-400">Temps de préparation</p>
                                    <p className="font-semibold">~10 minutes</p>
                                </div>
                                <div className="card p-4">
                                    <ShoppingCart className="w-5 h-5 text-accent-400 mb-2" />
                                    <p className="text-sm text-dark-400">Retrait</p>
                                    <p className="font-semibold">Click & Collect</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="section bg-dark-900/50">
                    <div className="container-custom">
                        <h2 className="text-2xl font-bold mb-8">Vous aimerez aussi</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <Link
                                    key={relatedProduct.id}
                                    href={`/menu/${relatedProduct.id}`}
                                    className="card-hover group"
                                >
                                    <div className="relative aspect-video overflow-hidden">
                                        {relatedProduct.image_url ? (
                                            <Image
                                                src={relatedProduct.image_url}
                                                alt={relatedProduct.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                sizes="(max-width: 640px) 100vw, 33vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-dark-800 text-5xl">
                                                {relatedProduct.category === 'burger' && '🍔'}
                                                {relatedProduct.category === 'pizza' && '🍕'}
                                                {relatedProduct.category === 'side' && '🍟'}
                                                {relatedProduct.category === 'drink' && '🥤'}
                                                {relatedProduct.category === 'dessert' && '🍰'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold group-hover:text-accent-400 transition-colors">
                                            {relatedProduct.name}
                                        </h3>
                                        <p className="text-accent-400 font-bold mt-1">
                                            {formatPrice(relatedProduct.price)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
