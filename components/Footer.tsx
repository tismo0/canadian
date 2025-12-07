/**
 * Footer Component
 * Site footer with links, social media, and contact info
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Facebook,
    Instagram,
    ChefHat,
    Heart
} from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        navigation: [
            { label: 'Accueil', href: '/' },
            { label: 'Menu', href: '/menu' },
            { label: 'À propos', href: '/about' },
            { label: 'Horaires', href: '/hours' },
            { label: 'Contact', href: '/contact' },
        ],
        legal: [
            { label: 'Conditions générales', href: '/terms' },
            { label: 'Politique de confidentialité', href: '/privacy' },
            { label: 'Mentions légales', href: '/legal' },
        ],
    };

    return (
        <footer className="bg-dark-900 border-t border-white/5">
            {/* Main Footer */}
            <div className="container-custom py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 group mb-4">
                            <div className="p-2 bg-primary-600 rounded-xl">
                                <ChefHat className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="font-display font-bold text-lg text-white">
                                    Canadian Burger
                                </span>
                                <span className="block text-xs text-dark-400">& Pizza • Spa</span>
                            </div>
                        </Link>
                        <p className="text-dark-400 text-sm mb-6">
                            Les meilleurs burgers et pizzas artisanales de Spa, préparés avec des ingrédients frais et de qualité.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-dark-800 hover:bg-primary-600 rounded-lg transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-dark-800 hover:bg-primary-600 rounded-lg transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Navigation</h4>
                        <ul className="space-y-2">
                            {footerLinks.navigation.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-dark-400 hover:text-accent-400 transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                                <span className="text-dark-400">
                                    Rue de la Station 42<br />
                                    4900 Spa, Belgique
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                <a href="tel:+32871234567" className="text-dark-400 hover:text-accent-400 transition-colors">
                                    +32 87 12 34 56
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                <a href="mailto:info@canadianburger.be" className="text-dark-400 hover:text-accent-400 transition-colors">
                                    info@canadianburger.be
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Opening Hours */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Horaires</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between">
                                <span className="text-dark-400">Lun - Jeu</span>
                                <span className="text-white">11h00 - 22h00</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-dark-400">Vendredi</span>
                                <span className="text-white">11h00 - 23h00</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-dark-400">Samedi</span>
                                <span className="text-white">12h00 - 23h00</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-dark-400">Dimanche</span>
                                <span className="text-white">12h00 - 21h00</span>
                            </li>
                        </ul>
                        <div className="mt-4 p-3 bg-accent-400/10 rounded-lg">
                            <div className="flex items-center gap-2 text-accent-400 text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                Click & Collect disponible
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-dark-500 text-sm text-center md:text-left">
                            © {currentYear} Canadian Burger & Pizza Spa. Tous droits réservés.
                        </p>

                        <div className="flex items-center gap-4">
                            {footerLinks.legal.map((link, index) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-dark-500 hover:text-dark-300 text-sm transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-dark-600 text-xs mt-4 flex items-center justify-center gap-1">
                        Fait avec <Heart className="w-3 h-3 text-primary-500" /> en Belgique
                    </p>
                </div>
            </div>
        </footer>
    );
}
