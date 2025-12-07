/**
 * Checkout Page
 * Customer info form and payment initiation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CreditCard, Loader2, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { formatPrice } from '@/lib/stripe';
import { createOrderSchema, type CreateOrderInput } from '@/lib/validations';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    const { user, profile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form state
    const [formData, setFormData] = useState({
        customer_name: profile?.full_name || '',
        customer_email: user?.email || '',
        customer_phone: profile?.phone || '',
        notes: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            // Prepare order data
            const orderData: CreateOrderInput = {
                items: items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    notes: item.notes,
                })),
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                notes: formData.notes || undefined,
            };

            // Validate with Zod
            const validation = createOrderSchema.safeParse(orderData);

            if (!validation.success) {
                const fieldErrors: Record<string, string> = {};
                validation.error.errors.forEach(err => {
                    const field = err.path[0] as string;
                    fieldErrors[field] = err.message;
                });
                setErrors(fieldErrors);
                setIsLoading(false);
                return;
            }

            // Create order and get Stripe checkout URL
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création de la commande');
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('URL de paiement non reçue');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setErrors({
                general: error instanceof Error ? error.message : 'Une erreur est survenue'
            });
            setIsLoading(false);
        }
    };

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <ShoppingBag className="w-16 h-16 text-dark-600 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
                <p className="text-dark-400 mb-6">Ajoutez des articles pour passer commande.</p>
                <Link href="/menu" className="btn-primary">Voir le menu</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <section className="bg-dark-900/50 border-b border-white/5">
                <div className="container-custom py-8">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour au panier
                    </Link>
                    <h1 className="text-3xl font-bold">Finaliser la commande</h1>
                </div>
            </section>

            {/* Checkout Form */}
            <section className="section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Form */}
                        <div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* General Error */}
                                {errors.general && (
                                    <div className="p-4 bg-primary-600/20 border border-primary-600/50 rounded-xl text-primary-400">
                                        {errors.general}
                                    </div>
                                )}

                                {/* Contact Info */}
                                <div className="card p-6">
                                    <h2 className="font-bold text-xl mb-6">Vos coordonnées</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="customer_name" className="block text-sm font-medium text-dark-300 mb-2">
                                                Nom complet *
                                            </label>
                                            <input
                                                type="text"
                                                id="customer_name"
                                                name="customer_name"
                                                value={formData.customer_name}
                                                onChange={handleInputChange}
                                                className={`input ${errors.customer_name ? 'border-primary-500' : ''}`}
                                                placeholder="Jean Dupont"
                                                required
                                            />
                                            {errors.customer_name && (
                                                <p className="text-primary-400 text-sm mt-1">{errors.customer_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="customer_email" className="block text-sm font-medium text-dark-300 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="customer_email"
                                                name="customer_email"
                                                value={formData.customer_email}
                                                onChange={handleInputChange}
                                                className={`input ${errors.customer_email ? 'border-primary-500' : ''}`}
                                                placeholder="jean@exemple.be"
                                                required
                                            />
                                            {errors.customer_email && (
                                                <p className="text-primary-400 text-sm mt-1">{errors.customer_email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="customer_phone" className="block text-sm font-medium text-dark-300 mb-2">
                                                Téléphone *
                                            </label>
                                            <input
                                                type="tel"
                                                id="customer_phone"
                                                name="customer_phone"
                                                value={formData.customer_phone}
                                                onChange={handleInputChange}
                                                className={`input ${errors.customer_phone ? 'border-primary-500' : ''}`}
                                                placeholder="+32 470 12 34 56"
                                                required
                                            />
                                            {errors.customer_phone && (
                                                <p className="text-primary-400 text-sm mt-1">{errors.customer_phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="card p-6">
                                    <h2 className="font-bold text-xl mb-6">Instructions spéciales</h2>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="input min-h-[100px] resize-none"
                                        placeholder="Allergies, demandes spéciales..."
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-accent w-full justify-center btn-lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Redirection vers le paiement...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            Payer {formatPrice(subtotal)}
                                        </>
                                    )}
                                </button>

                                <p className="flex items-center justify-center gap-2 text-xs text-dark-500">
                                    <Lock className="w-3 h-3" />
                                    Paiement sécurisé par Stripe
                                </p>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <div className="card p-6 sticky top-24">
                                <h2 className="font-bold text-xl mb-6">Votre commande</h2>

                                <ul className="space-y-4 mb-6">
                                    {items.map((item) => (
                                        <li key={item.product.id} className="flex gap-4">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-dark-800 flex-shrink-0">
                                                {item.product.image_url ? (
                                                    <Image
                                                        src={item.product.image_url}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                                        {item.product.category === 'burger' && '🍔'}
                                                        {item.product.category === 'pizza' && '🍕'}
                                                        {item.product.category === 'side' && '🍟'}
                                                        {item.product.category === 'drink' && '🥤'}
                                                        {item.product.category === 'dessert' && '🍰'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{item.product.name}</p>
                                                <p className="text-sm text-dark-400">Qté: {item.quantity}</p>
                                            </div>
                                            <span className="font-semibold">
                                                {formatPrice(item.product.price * item.quantity)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t border-white/10 pt-4 space-y-2">
                                    <div className="flex justify-between text-dark-300">
                                        <span>Sous-total</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span className="text-accent-400">{formatPrice(subtotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
