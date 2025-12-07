/**
 * Root Layout
 * Provides global providers, navbar and footer
 */

import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/cart-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';

// Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

// Metadata
export const metadata: Metadata = {
  title: {
    default: 'Canadian Burger & Pizza | Spa, Belgique',
    template: '%s | Canadian Burger & Pizza',
  },
  description: 'Les meilleurs burgers et pizzas artisanales de Spa. Commandez en ligne, payez et récupérez votre commande avec votre QR code. Click & Collect rapide et facile.',
  keywords: ['burger', 'pizza', 'spa', 'belgique', 'click and collect', 'commande en ligne', 'restaurant'],
  authors: [{ name: 'Canadian Burger & Pizza' }],
  creator: 'Canadian Burger & Pizza',
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    url: 'https://canadianburger.be',
    siteName: 'Canadian Burger & Pizza',
    title: 'Canadian Burger & Pizza | Spa, Belgique',
    description: 'Les meilleurs burgers et pizzas artisanales de Spa. Commandez en ligne!',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canadian Burger & Pizza | Spa, Belgique',
    description: 'Les meilleurs burgers et pizzas artisanales de Spa.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            {/* Skip to content link for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-400 focus:text-dark-900 focus:rounded-lg"
            >
              Aller au contenu principal
            </a>

            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <main id="main-content" className="min-h-screen pt-16 md:pt-20">
              {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Cart Drawer */}
            <Cart />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
