/**
 * Home Page
 * Modern landing page with hero, featured products, and CTAs
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Clock, MapPin, Sparkles, ChefHat, Truck } from 'lucide-react';
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
      <section className="relative min-h-[90vh] flex items-center hero-pattern bg-cream">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl" />

        <div className="container-custom relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-600 text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-current" />
                #1 à Spa depuis 2020
              </div>

              {/* Heading */}
              <h1 className="text-neutral-900 mb-6">
                DES{' '}
                <span className="text-primary-600">BURGERS</span>
                {' '}ET{' '}
                <span className="text-accent-500">PIZZAS</span>
                {' '}D&apos;EXCEPTION
              </h1>

              {/* Description */}
              <p className="text-lg text-neutral-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Savourez nos recettes artisanales préparées avec des ingrédients frais et locaux.
                Commandez en ligne et récupérez votre commande en quelques minutes.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/menu" className="btn-accent btn-xl">
                  Commander maintenant
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/menu" className="btn-outline-dark btn-xl">
                  Voir le menu
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-display text-primary-600">15+</p>
                  <p className="text-sm text-neutral-500">Recettes signature</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-display text-primary-600">10MIN</p>
                  <p className="text-sm text-neutral-500">Temps de préparation</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-display text-primary-600">5000+</p>
                  <p className="text-sm text-neutral-500">Clients satisfaits</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-accent-400/20 rounded-full blur-3xl animate-pulse-soft" />

                {/* Main circular image placeholder */}
                <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-neutral-100 to-white flex items-center justify-center text-9xl animate-float shadow-2xl border-4 border-white">
                  🍔
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 p-4 bg-white rounded-2xl shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                  <span className="text-4xl">🍕</span>
                </div>
                <div className="absolute -bottom-4 -left-4 p-4 bg-white rounded-2xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <span className="text-4xl">🍟</span>
                </div>
                <div className="absolute top-1/2 -right-8 p-3 bg-accent-400 rounded-xl shadow-yellow animate-float" style={{ animationDelay: '1.5s' }}>
                  <Sparkles className="w-6 h-6 text-neutral-900" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="w-6 h-10 border-2 border-neutral-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-neutral-400 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Click & Collect',
                description: 'Commandez en ligne et récupérez votre commande en 10 minutes',
                color: 'bg-accent-100 text-accent-600',
              },
              {
                icon: ChefHat,
                title: 'Qualité Premium',
                description: 'Ingrédients frais et locaux, recettes artisanales maison',
                color: 'bg-primary-100 text-primary-600',
              },
              {
                icon: MapPin,
                title: 'Au cœur de Spa',
                description: 'Situés en plein centre-ville, facilement accessible',
                color: 'bg-green-100 text-green-600',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="card card-bordered p-6 text-center hover:shadow-lg transition-all group"
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif', textTransform: 'none' }}>
                  {feature.title}
                </h3>
                <p className="text-neutral-500 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="section bg-neutral-50">
          <div className="container-custom">
            {/* Section Header */}
            <div className="text-center mb-12">
              <span className="badge-accent mb-4">⭐ Nos best-sellers</span>
              <h2 className="text-neutral-900 mb-4">
                LES FAVORIS DE NOS CLIENTS
              </h2>
              <div className="divider-accent mx-auto" />
              <p className="text-neutral-500 max-w-2xl mx-auto mt-4">
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
      <section className="section relative overflow-hidden bg-primary-600">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
        </div>

        <div className="container-custom relative z-10 text-center">
          <h2 className="text-white mb-6">
            PRÊT À COMMANDER ?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Faites-vous plaisir avec nos délicieux burgers et pizzas.
            Commandez maintenant et récupérez votre commande en quelques minutes !
          </p>
          <Link href="/menu" className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-xl shadow-lg">
            Commander maintenant
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
