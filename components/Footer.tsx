/**
 * Footer Component
 * Clean, modern footer with light theme
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
    Heart,
    ArrowUpRight
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
            { label: 'Confidentialité', href: '/privacy' },
            { label: 'Mentions légales', href: '/legal' },
        ],
    };

    return (
        <footer className="bg-white border-t border-neutral-100">
            {/* CTA Banner */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-8 md:py-10">
                <div className="container-custom text-center">
                    <h3 className="text-2xl md:text-3xl text-white mb-3">
                        ENVIE D&apos;UN DÉLICIEUX BURGER ?
                    </h3>
                    <p className="text-white/80 mb-5 max-w-xl mx-auto">
                        Commandez en ligne et récupérez votre commande en quelques minutes
                    </p>
                    <Link href="/menu" className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-lg shadow-lg">
                        Commander maintenant
                        <ArrowUpRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container-custom py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 group mb-4">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-red">
                                <span className="text-white text-xl font-bold">CB</span>
                            </div>
                            <div>
                                <span className="font-display text-xl tracking-wide text-neutral-900">
                                    CANADIAN BURGER
                                </span>
                                <span className="block text-xs text-neutral-500 -mt-0.5">& Pizza • Spa</span>
                            </div>
                        </Link>
                        <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                            Les meilleurs burgers et pizzas artisanales de Spa, préparés avec des ingrédients frais et de qualité.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-2">
                            <motion.a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2.5 bg-neutral-100 hover:bg-primary-600 hover:text-white text-neutral-600 rounded-xl transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2.5 bg-neutral-100 hover:bg-primary-600 hover:text-white text-neutral-600 rounded-xl transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </motion.a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h4 className="font-semibold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Navigation</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.navigation.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-neutral-500 hover:text-primary-600 transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm">
                                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-primary-600" />
                                </div>
                                <span className="text-neutral-600 pt-1">
                                    Rue de la Station 42<br />
                                    4900 Spa, Belgique
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-4 h-4 text-primary-600" />
                                </div>
                                <a href="tel:+32871234567" className="text-neutral-600 hover:text-primary-600 transition-colors">
                                    +32 87 12 34 56
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-4 h-4 text-primary-600" />
                                </div>
                                <a href="mailto:info@canadianburger.be" className="text-neutral-600 hover:text-primary-600 transition-colors">
                                    info@canadianburger.be
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Opening Hours */}
                    <div>
                        <h4 className="font-semibold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Horaires</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between py-1.5 border-b border-neutral-100">
                                <span className="text-neutral-500">Lun - Jeu</span>
                                <span className="text-neutral-900 font-medium">11h00 - 22h00</span>
                            </li>
                            <li className="flex justify-between py-1.5 border-b border-neutral-100">
                                <span className="text-neutral-500">Vendredi</span>
                                <span className="text-neutral-900 font-medium">11h00 - 23h00</span>
                            </li>
                            <li className="flex justify-between py-1.5 border-b border-neutral-100">
                                <span className="text-neutral-500">Samedi</span>
                                <span className="text-neutral-900 font-medium">12h00 - 23h00</span>
                            </li>
                            <li className="flex justify-between py-1.5">
                                <span className="text-neutral-500">Dimanche</span>
                                <span className="text-neutral-900 font-medium">12h00 - 21h00</span>
                            </li>
                        </ul>
                        <div className="mt-4 p-3 bg-accent-100 rounded-xl">
                            <div className="flex items-center gap-2 text-accent-700 text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                Click & Collect disponible
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-neutral-100 bg-neutral-50">
                <div className="container-custom py-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-neutral-500 text-sm text-center md:text-left">
                            © {currentYear} Canadian Burger & Pizza Spa. Tous droits réservés.
                        </p>

                        <div className="flex items-center gap-4">
                            {footerLinks.legal.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-neutral-500 hover:text-neutral-700 text-sm transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-neutral-400 text-xs mt-4 flex items-center justify-center gap-1">
                        Fait avec <Heart className="w-3 h-3 text-primary-500 fill-primary-500" /> en Belgique
                    </p>
                </div>
            </div>
        </footer>
    );
}
