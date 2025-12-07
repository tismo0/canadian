/**
 * Home Page
 * Landing page with hero, featured products, and CTAs
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Clock, MapPin, Truck } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

// Revalidate every 5 minutes
export const revalidate = 300;

async function getFeaturedProducts() {
  const supabase = await createServerSupabaseClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .eq('is_featured', true)
    .order('sort_order')
    .limit(6);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return products;
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
          {/* Decorative elements */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="container-custom relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/20 rounded-full text-primary-400 text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-current" />
                #1 à Spa depuis 2020
              </div>

              {/* Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
                Des{' '}
                <span className="gradient-text">burgers</span>
                {' '}et{' '}
                <span className="gradient-text">pizzas</span>
                {' '}d&apos;exception
              </h1>

              {/* Description */}
              <p className="text-xl text-dark-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Savourez nos recettes artisanales préparées avec des ingrédients frais et locaux.
                Commandez en ligne et récupérez votre commande en quelques minutes.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/menu" className="btn-accent btn-lg">
                  Commander maintenant
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/menu" className="btn-outline btn-lg">
                  Voir le menu
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-bold text-accent-400">15+</p>
                  <p className="text-sm text-dark-400">Recettes signature</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-bold text-accent-400">10min</p>
                  <p className="text-sm text-dark-400">Temps de préparation</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-bold text-accent-400">5000+</p>
                  <p className="text-sm text-dark-400">Clients satisfaits</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/30 to-accent-400/30 rounded-full blur-3xl animate-glow" />

                {/* Main image placeholder - Replace with actual burger image */}
                <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center text-9xl animate-float">
                  🍔
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 p-4 glass rounded-xl animate-float" style={{ animationDelay: '0.5s' }}>
                  <span className="text-4xl">🍕</span>
                </div>
                <div className="absolute -bottom-4 -left-4 p-4 glass rounded-xl animate-float" style={{ animationDelay: '1s' }}>
                  <span className="text-4xl">🍟</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/40 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-dark-900/50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Click & Collect',
                description: 'Commandez en ligne et récupérez votre commande en 10 minutes',
                color: 'text-accent-400',
              },
              {
                icon: Star,
                title: 'Qualité Premium',
                description: 'Ingrédients frais et locaux, recettes artisanales maison',
                color: 'text-primary-400',
              },
              {
                icon: MapPin,
                title: 'Au cœur de Spa',
                description: 'Situés en plein centre-ville, facilement accessible',
                color: 'text-green-400',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="card p-6 text-center hover:border-white/20 transition-colors"
              >
                <div className={`inline-flex p-3 rounded-xl bg-dark-800 mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="section">
          <div className="container-custom">
            {/* Section Header */}
            <div className="text-center mb-12">
              <span className="badge-accent mb-4">Nos best-sellers</span>
              <h2 className="text-4xl font-display font-bold mb-4">
                Les favoris de nos clients
              </h2>
              <p className="text-dark-400 max-w-2xl mx-auto">
                Découvrez nos créations les plus populaires, préparées avec passion et des ingrédients de première qualité.
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 3}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <Link href="/menu" className="btn-primary btn-lg">
                Voir tout le menu
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700" />
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />

        <div className="container-custom relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Prêt à commander?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Faites-vous plaisir avec nos délicieux burgers et pizzas.
            Commandez maintenant et récupérez votre commande en quelques minutes!
          </p>
          <Link href="/menu" className="btn bg-white text-primary-600 hover:bg-dark-100 btn-lg">
            Commander maintenant
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
