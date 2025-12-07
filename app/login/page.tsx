/**
 * Login Page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ChefHat, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { loginSchema } from '@/lib/validations';

export default function LoginPage() {
    const router = useRouter();
    const { signIn, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate
        const validation = loginSchema.safeParse(formData);
        if (!validation.success) {
            setError(validation.error.errors[0].message);
            setIsLoading(false);
            return;
        }

        const { error: signInError } = await signIn(formData.email, formData.password);

        if (signInError) {
            if (signInError.message.includes('Invalid login')) {
                setError('Email ou mot de passe incorrect');
            } else {
                setError(signInError.message);
            }
            setIsLoading(false);
            return;
        }

        router.push('/');
        router.refresh();
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="p-2 bg-primary-600 rounded-xl">
                            <ChefHat className="w-8 h-8 text-white" />
                        </div>
                        <span className="font-display font-bold text-2xl">Canadian Burger</span>
                    </Link>
                </div>

                {/* Form Card */}
                <div className="card p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">Connexion</h1>
                    <p className="text-dark-400 text-center mb-8">
                        Connectez-vous pour suivre vos commandes
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-primary-600/20 border border-primary-600/50 rounded-xl text-primary-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input pl-12"
                                    placeholder="votre@email.be"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input pl-12"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || authLoading}
                            className="btn-accent w-full justify-center"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Se connecter
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-dark-400 text-sm mt-6">
                        Pas encore de compte?{' '}
                        <Link href="/register" className="text-accent-400 hover:underline">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
