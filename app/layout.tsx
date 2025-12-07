/**
 * Root Layout
 * Provides global providers, navbar and footer
 */

import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/cart-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import AnnouncementBanner from '@/components/AnnouncementBanner';

// Fonts - Restaurant Theme
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
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
    <html lang="fr" className={`${playfair.variable} ${lato.variable}`}>
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

            {/* Announcement Banner */}
            <AnnouncementBanner />

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

