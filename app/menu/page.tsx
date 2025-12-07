/**
 * Menu Page
 * Product listing with category filters
 */

import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import type { Product, ProductCategory } from '@/types/database';

// Revalidate every 5 minutes
export const revalidate = 300;

export const metadata = {
    title: 'Menu',
    description: 'Découvrez notre carte complète de burgers, pizzas, accompagnements et desserts. Commandez en ligne!',
};

// Category config
const categories: { id: ProductCategory | 'all'; label: string; emoji: string }[] = [
    { id: 'all', label: 'Tout', emoji: '🍽️' },
    { id: 'burger', label: 'Burgers', emoji: '🍔' },
    { id: 'pizza', label: 'Pizzas', emoji: '🍕' },
    { id: 'side', label: 'Accompagnements', emoji: '🍟' },
    { id: 'drink', label: 'Boissons', emoji: '🥤' },
    { id: 'dessert', label: 'Desserts', emoji: '🍰' },
];

async function getProducts(category?: ProductCategory): Promise<Product[]> {
    const supabase = await createServerSupabaseClient();

    let query = supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('sort_order');

    if (category) {
        query = query.eq('category', category);
    }

    const { data: products, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return products as Product[];
}

// Category filter component
function CategoryFilter({
    activeCategory
}: {
    activeCategory: ProductCategory | 'all'
}) {
    return (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => {
                const isActive = cat.id === activeCategory;
                const href = cat.id === 'all' ? '/menu' : `/menu?category=${cat.id}`;

                return (
                    <a
                        key={cat.id}
                        href={href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                            : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
                            }`}
                    >
                        <span>{cat.emoji}</span>
                        {cat.label}
                    </a>
                );
            })}
        </div>
    );
}

// Products grid skeleton
function ProductsSkeleton() {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="card">
                    <div className="aspect-square skeleton" />
                    <div className="p-4 space-y-3">
                        <div className="h-6 w-3/4 skeleton" />
                        <div className="h-4 w-full skeleton" />
                        <div className="h-4 w-1/2 skeleton" />
                        <div className="flex justify-between items-center pt-2">
                            <div className="h-6 w-20 skeleton" />
                            <div className="h-10 w-24 skeleton rounded-lg" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Products list component
async function ProductsList({
    category
}: {
    category?: ProductCategory
}) {
    const products = await getProducts(category);

    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-6xl mb-4">😕</p>
                <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                <p className="text-dark-400">
                    Essayez une autre catégorie ou revenez plus tard.
                </p>
            </div>
        );
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 6}
                />
            ))}
        </div>
    );
}

export default async function MenuPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: ProductCategory }>;
}) {
    const params = await searchParams;
    const category = params.category;
    const activeCategory = category || 'all';

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative py-16 md:py-24 bg-gradient-to-b from-dark-900 to-dark-950">
                <div className="container-custom text-center">
                    <span className="badge-accent mb-4">Notre carte</span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                        Découvrez notre menu
                    </h1>
                    <p className="text-dark-400 max-w-2xl mx-auto">
                        Des burgers juteux, des pizzas croustillantes et des accompagnements gourmands.
                        Tous nos produits sont préparés sur place avec des ingrédients frais.
                    </p>
                </div>
            </section>

            {/* Menu Content */}
            <section className="section">
                <div className="container-custom">
                    {/* Category Filter */}
                    <CategoryFilter activeCategory={activeCategory} />

                    {/* Products Grid */}
                    <Suspense fallback={<ProductsSkeleton />}>
                        <ProductsList category={category} />
                    </Suspense>
                </div>
            </section>
        </div>
    );
}
