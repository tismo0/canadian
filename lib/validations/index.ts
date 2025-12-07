/**
 * Zod validation schemas for API endpoints
 * Provides type-safe validation for all inputs
 */

import { z } from 'zod';

// ============================================
// Product Schemas
// ============================================

export const productCategorySchema = z.enum([
    'burger',
    'pizza',
    'side',
    'drink',
    'dessert',
]);

export const createProductSchema = z.object({
    name: z.string().min(2, 'Nom requis (min 2 caractères)').max(100),
    description: z.string().max(500).optional(),
    price: z.number().min(0, 'Prix doit être positif'),
    category: productCategorySchema,
    is_available: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    sort_order: z.number().int().default(0),
    image_url: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ============================================
// Order Schemas
// ============================================

export const orderStatusSchema = z.enum([
    'pending',
    'paid',
    'preparing',
    'ready',
    'completed',
    'cancelled',
]);

export const orderItemSchema = z.object({
    product_id: z.string().uuid('ID produit invalide'),
    quantity: z.number().int().min(1, 'Quantité minimum: 1').max(20, 'Quantité maximum: 20'),
    notes: z.string().max(200).optional(),
});

export const createOrderSchema = z.object({
    items: z
        .array(orderItemSchema)
        .min(1, 'Au moins un article requis')
        .max(50, 'Maximum 50 articles par commande'),
    customer_name: z
        .string()
        .min(2, 'Nom requis (min 2 caractères)')
        .max(100, 'Nom trop long'),
    customer_phone: z
        .string()
        .regex(/^(\+32|0)[0-9]{8,9}$/, 'Numéro de téléphone belge invalide'),
    customer_email: z
        .string()
        .email('Email invalide'),
    notes: z.string().max(500).optional(),
    pickup_time: z.string().datetime().optional(),
});

export const updateOrderStatusSchema = z.object({
    status: orderStatusSchema,
});

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Mot de passe: minimum 6 caractères'),
});

export const registerSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z
        .string()
        .min(8, 'Mot de passe: minimum 8 caractères')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'
        ),
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Nom complet requis').max(100),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
    full_name: z.string().min(2).max(100).optional(),
    phone: z.string().regex(/^(\+32|0)[0-9]{8,9}$/).optional().or(z.literal('')),
    address: z.string().max(300).optional(),
});

// ============================================
// QR Scan Schema
// ============================================

export const qrScanSchema = z.object({
    qr_data: z.string().min(10, 'Données QR invalides'),
});

// ============================================
// Admin Log Schema
// ============================================

export const createAdminLogSchema = z.object({
    action: z.string().min(1).max(100),
    entity_type: z.string().min(1).max(50),
    entity_id: z.string().uuid().optional(),
    old_data: z.record(z.string(), z.unknown()).optional(),
    new_data: z.record(z.string(), z.unknown()).optional(),
});

// ============================================
// Search & Filter Schemas
// ============================================

export const productFilterSchema = z.object({
    category: productCategorySchema.optional(),
    search: z.string().max(100).optional(),
    available_only: z.boolean().default(true),
    featured_only: z.boolean().default(false),
});

export const orderFilterSchema = z.object({
    status: orderStatusSchema.optional(),
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
    user_id: z.string().uuid().optional(),
});

export const paginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
});

// ============================================
// Type exports from schemas
// ============================================

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type QRScanInput = z.infer<typeof qrScanSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
