/**
 * Admin Products Page
 * CRUD operations for products with image upload
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Pencil,
    Trash2,
    ArrowLeft,
    Upload,
    X,
    Loader2,
    Save,
    Image as ImageIcon
} from 'lucide-react';
import { useRequireAdmin } from '@/contexts/auth-context';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';
import { createProductSchema, updateProductSchema } from '@/lib/validations';
import type { Product, ProductCategory } from '@/types/database';

const categories: { id: ProductCategory; label: string }[] = [
    { id: 'burger', label: 'Burger' },
    { id: 'pizza', label: 'Pizza' },
    { id: 'side', label: 'Accompagnement' },
    { id: 'drink', label: 'Boisson' },
    { id: 'dessert', label: 'Dessert' },
];

export default function AdminProductsPage() {
    const { loading: authLoading } = useRequireAdmin();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createBrowserSupabaseClient();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'burger' as ProductCategory,
        is_available: true,
        is_featured: false,
        image_url: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('category')
            .order('sort_order');

        if (!error && data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                category: product.category,
                is_available: product.is_available,
                is_featured: product.is_featured,
                image_url: product.image_url || '',
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'burger',
                is_available: true,
                is_featured: false,
                image_url: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            alert('Erreur lors de l\'upload');
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);

        setFormData(prev => ({ ...prev, image_url: publicUrl }));
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const productData = {
            name: formData.name,
            description: formData.description || undefined,
            price: parseFloat(formData.price),
            category: formData.category,
            is_available: formData.is_available,
            is_featured: formData.is_featured,
            image_url: formData.image_url || undefined,
        };

        // Validate
        const schema = editingProduct ? updateProductSchema : createProductSchema;
        const validation = schema.safeParse(productData);

        if (!validation.success) {
            alert(validation.error.errors[0].message);
            setSaving(false);
            return;
        }

        if (editingProduct) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('products')
                .update(productData)
                .eq('id', editingProduct.id);

            if (!error) {
                await fetchProducts();
            }
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('products')
                .insert(productData);

            if (!error) {
                await fetchProducts();
            }
        }

        setSaving(false);
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce produit?')) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (!error) {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const toggleAvailability = async (product: Product) => {
        const newValue = !product.is_available;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('products')
            .update({ is_available: newValue })
            .eq('id', product.id);

        if (!error) {
            setProducts(prev =>
                prev.map(p => p.id === product.id ? { ...p, is_available: newValue } : p)
            );
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950">
            {/* Header */}
            <div className="bg-dark-900 border-b border-white/5">
                <div className="container-custom py-6">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour au dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Gestion des produits</h1>
                        <button onClick={() => openModal()} className="btn-primary">
                            <Plus className="w-5 h-5" />
                            Nouveau produit
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container-custom py-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className={`card ${!product.is_available ? 'opacity-50' : ''}`}>
                            <div className="relative aspect-square bg-dark-800">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="250px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl">
                                        {product.category === 'burger' && '🍔'}
                                        {product.category === 'pizza' && '🍕'}
                                        {product.category === 'side' && '🍟'}
                                        {product.category === 'drink' && '🥤'}
                                        {product.category === 'dessert' && '🍰'}
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                                    <span className="text-accent-400 font-bold">{formatPrice(product.price)}</span>
                                </div>
                                <p className="text-xs text-dark-400 capitalize mb-4">{product.category}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleAvailability(product)}
                                        className={`flex-1 text-xs py-2 rounded-lg transition-colors ${product.is_available
                                            ? 'bg-success-500/20 text-success-500'
                                            : 'bg-dark-700 text-dark-400'
                                            }`}
                                    >
                                        {product.is_available ? 'Disponible' : 'Indisponible'}
                                    </button>
                                    <button
                                        onClick={() => openModal(product)}
                                        className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-dark-900 rounded-2xl z-50 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <h2 className="font-bold text-lg">
                                    {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                                </h2>
                                <button onClick={closeModal} className="p-2 hover:bg-dark-800 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Image</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative aspect-video bg-dark-800 rounded-xl cursor-pointer hover:bg-dark-700 transition-colors overflow-hidden"
                                    >
                                        {formData.image_url ? (
                                            <Image
                                                src={formData.image_url}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full">
                                                {uploading ? (
                                                    <Loader2 className="w-8 h-8 animate-spin" />
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-12 h-12 text-dark-500 mb-2" />
                                                        <span className="text-sm text-dark-400">Cliquez pour uploader</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Nom *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input min-h-[80px] resize-none"
                                    />
                                </div>

                                {/* Price & Category */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-2">Prix (€) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-2">Catégorie *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                                            className="input"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_available}
                                            onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Disponible</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_featured}
                                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Vedette</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-accent w-full justify-center"
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {editingProduct ? 'Enregistrer' : 'Créer'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
