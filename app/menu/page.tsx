/**
 * Menu Page
 * Product listing with modern category filters
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
        <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => {
                const isActive = cat.id === activeCategory;
                const href = cat.id === 'all' ? '/menu' : `/menu?category=${cat.id}`;

                return (
                    <a
                        key={cat.id}
                        href={href}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                            : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-neutral-200'
                            }`}
                    >
                        <span className="text-base">{cat.emoji}</span>
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
                <div key={i} className="card bg-white rounded-xl overflow-hidden">
                    <div className="aspect-[4/3] skeleton" />
                    <div className="p-4 space-y-3">
                        <div className="h-5 w-3/4 skeleton rounded" />
                        <div className="h-4 w-full skeleton rounded" />
                        <div className="h-4 w-1/2 skeleton rounded" />
                        <div className="flex justify-between items-center pt-2">
                            <div className="h-6 w-20 skeleton rounded" />
                            <div className="h-9 w-24 skeleton rounded-lg" />
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
                <h3 className="text-xl font-semibold text-neutral-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif', textTransform: 'none' }}>
                    Aucun produit trouvé
                </h3>
                <p className="text-neutral-500">
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
        <div className="min-h-screen bg-neutral-50">
            {/* Hero */}
            <section className="relative py-16 md:py-20 bg-white border-b border-neutral-100">
                <div className="container-custom text-center">
                    <span className="badge-primary mb-4">🍽️ Notre carte</span>
                    <h1 className="text-neutral-900 mb-4">
                        DÉCOUVREZ NOTRE MENU
                    </h1>
                    <div className="divider-accent mx-auto" />
                    <p className="text-neutral-500 max-w-2xl mx-auto mt-4">
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
