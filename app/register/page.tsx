/**
 * Register Page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ChefHat, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { registerSchema } from '@/lib/validations';

export default function RegisterPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        // Validate
        const validation = registerSchema.safeParse(formData);
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

        const { error: signUpError } = await signUp(
            formData.email,
            formData.password,
            formData.fullName
        );

        if (signUpError) {
            if (signUpError.message.includes('already registered')) {
                setErrors({ email: 'Cet email est déjà utilisé' });
            } else {
                setErrors({ general: signUpError.message });
            }
            setIsLoading(false);
            return;
        }

        setSuccess(true);
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="inline-flex p-4 bg-success-500/20 rounded-full mb-6">
                        <Check className="w-12 h-12 text-success-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Inscription réussie!</h1>
                    <p className="text-dark-400 mb-8">
                        Un email de confirmation a été envoyé à <strong>{formData.email}</strong>.
                        Cliquez sur le lien dans l'email pour activer votre compte.
                    </p>
                    <Link href="/login" className="btn-primary">
                        Retour à la connexion
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
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
                    <h1 className="text-2xl font-bold text-center mb-2">Créer un compte</h1>
                    <p className="text-dark-400 text-center mb-8">
                        Inscrivez-vous pour commander plus rapidement
                    </p>

                    {errors.general && (
                        <div className="mb-6 p-4 bg-primary-600/20 border border-primary-600/50 rounded-xl text-primary-400 text-sm">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-dark-300 mb-2">
                                Nom complet
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="text"
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className={`input pl-12 ${errors.fullName ? 'border-primary-500' : ''}`}
                                    placeholder="Jean Dupont"
                                    required
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-primary-400 text-sm mt-1">{errors.fullName}</p>
                            )}
                        </div>

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
                                    className={`input pl-12 ${errors.email ? 'border-primary-500' : ''}`}
                                    placeholder="votre@email.be"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="text-primary-400 text-sm mt-1">{errors.email}</p>
                            )}
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
                                    className={`input pl-12 ${errors.password ? 'border-primary-500' : ''}`}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {errors.password && (
                                <p className="text-primary-400 text-sm mt-1">{errors.password}</p>
                            )}
                            <p className="text-xs text-dark-500 mt-1">
                                Min. 8 caractères, 1 majuscule, 1 chiffre
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-300 mb-2">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className={`input pl-12 ${errors.confirmPassword ? 'border-primary-500' : ''}`}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-primary-400 text-sm mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-accent w-full justify-center"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Créer mon compte
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-dark-400 text-sm mt-6">
                        Déjà inscrit?{' '}
                        <Link href="/login" className="text-accent-400 hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
