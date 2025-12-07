/**
 * Database type definitions for Supabase
 * Auto-generated based on migrations.sql schema
 */

// User roles for RBAC
export type UserRole = 'customer' | 'staff' | 'admin';

// Product categories
export type ProductCategory = 'burger' | 'pizza' | 'side' | 'drink' | 'dessert';

// Order status
export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// Payment status
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

// Profile type (linked to auth.users)
export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    address: string | null;
    role: UserRole;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

// Product type
export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    category: ProductCategory;
    is_available: boolean;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

// Order type
export interface Order {
    id: string;
    order_number: number;
    user_id: string;
    status: OrderStatus;
    total: number;
    payment_intent_id: string | null;
    payment_status: PaymentStatus;
    qr_token: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    notes: string | null;
    pickup_time: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined relations
    items?: OrderItem[];
    profile?: Profile;
}

// Order item type
export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes: string | null;
    created_at: string;
    // Joined relations
    product?: Product;
}

// Admin log type
export interface AdminLog {
    id: string;
    admin_id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    // Joined relations
    admin?: Profile;
}

// Cart item type (client-side)
export interface CartItem {
    product: Product;
    quantity: number;
    notes?: string;
}

// Supabase Database type for strong typing
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
            };
            products: {
                Row: Product;
                Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
            };
            orders: {
                Row: Order;
                Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'items' | 'profile'>;
                Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'items' | 'profile'>>;
            };
            order_items: {
                Row: OrderItem;
                Insert: Omit<OrderItem, 'id' | 'created_at' | 'product'>;
                Update: Partial<Omit<OrderItem, 'id' | 'created_at' | 'product'>>;
            };
            admin_logs: {
                Row: AdminLog;
                Insert: Omit<AdminLog, 'id' | 'created_at' | 'admin'>;
                Update: never;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            user_role: UserRole;
            product_category: ProductCategory;
            order_status: OrderStatus;
            payment_status: PaymentStatus;
        };
    };
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create order request
export interface CreateOrderRequest {
    items: Array<{
        product_id: string;
        quantity: number;
        notes?: string;
    }>;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    notes?: string;
    pickup_time?: string;
}

// QR code payload
export interface QRPayload {
    order_id: string;
    token: string;
    signature: string;
}

// Stripe checkout session response
export interface CheckoutSessionResponse {
    sessionId: string;
    url: string;
}
