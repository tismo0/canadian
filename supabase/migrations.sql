-- ============================================
-- Canadian Burger & Pizza - Supabase Migrations
-- Version: 1.0.0
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (linked to auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on role for faster filtering
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('burger', 'pizza', 'side', 'drink', 'dessert')),
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for filtering
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_available ON public.products(is_available);
CREATE INDEX idx_products_featured ON public.products(is_featured);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number SERIAL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled')),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    payment_intent_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),
    qr_token TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    notes TEXT,
    pickup_time TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_intent ON public.orders(payment_intent_id);
CREATE INDEX idx_orders_qr_token ON public.orders(qr_token);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on order_id for faster joins
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- ============================================
-- ADMIN LOGS TABLE (Audit Trail)
-- ============================================
CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for filtering
CREATE INDEX idx_admin_logs_admin ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON public.admin_logs(action);
CREATE INDEX idx_admin_logs_entity ON public.admin_logs(entity_type, entity_id);
CREATE INDEX idx_admin_logs_created ON public.admin_logs(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = 'customer');

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- PRODUCTS POLICIES
-- Everyone can view available products
CREATE POLICY "Everyone can view products"
    ON public.products FOR SELECT
    USING (is_available = true);

-- Admins can view all products including unavailable
CREATE POLICY "Admins can view all products"
    ON public.products FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can insert products
CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update products
CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete products
CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ORDERS POLICIES
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Staff and admins can view all orders
CREATE POLICY "Staff can view all orders"
    ON public.orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Staff and admins can update orders (status changes)
CREATE POLICY "Staff can update orders"
    ON public.orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- ORDER ITEMS POLICIES
-- Users can view their own order items
CREATE POLICY "Users can view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Users can insert their own order items
CREATE POLICY "Users can insert own order items"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Staff and admins can view all order items
CREATE POLICY "Staff can view all order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- ADMIN LOGS POLICIES
-- Only admins can view logs
CREATE POLICY "Admins can view logs"
    ON public.admin_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can insert logs
CREATE POLICY "Admins can insert logs"
    ON public.admin_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- STORAGE POLICIES (for products bucket)
-- ============================================
-- Run these in the Supabase Dashboard > Storage > Policies

-- Allow public read access to product images
-- INSERT INTO storage.policies (name, bucket_id, operation, definition)
-- VALUES (
--     'Public read access',
--     'products',
--     'SELECT',
--     'true'
-- );

-- Allow authenticated admins to upload images
-- INSERT INTO storage.policies (name, bucket_id, operation, definition)
-- VALUES (
--     'Admin upload access',
--     'products',
--     'INSERT',
--     'EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin'')'
-- );

-- ============================================
-- SEED DATA (Sample Products)
-- ============================================
INSERT INTO public.products (name, description, price, category, is_available, is_featured, sort_order) VALUES
-- Burgers
('Canadian Burger Classic', 'Steak haché 150g, cheddar vieilli, bacon fumé, sauce signature, oignons caramélisés', 12.90, 'burger', true, true, 1),
('Double Trouble', 'Double steak 300g, double cheddar, pickles, oignons frits, sauce BBQ maison', 16.90, 'burger', true, true, 2),
('Veggie Delight', 'Galette végétale, avocat, tomate, roquette, sauce tahini-citron', 11.90, 'burger', true, false, 3),
('Chicken Crispy', 'Poulet pané croustillant, coleslaw maison, cornichons, sauce ranch', 13.90, 'burger', true, false, 4),
('BBQ Bacon Beast', 'Steak 200g, bacon double, onion rings, cheddar fumé, sauce BBQ épicée', 15.90, 'burger', true, true, 5),

-- Pizzas
('Margherita Premium', 'Sauce tomate San Marzano, mozzarella di bufala, basilic frais', 11.90, 'pizza', true, false, 1),
('Pepperoni Lovers', 'Sauce tomate, mozzarella, pepperoni importé, piments', 13.90, 'pizza', true, true, 2),
('4 Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre, miel et noix', 14.90, 'pizza', true, false, 3),
('Canadian Special', 'Bacon canadien, champignons, poivrons, oignons, sauce tomate', 14.90, 'pizza', true, true, 4),
('Pizza Végétarienne', 'Légumes grillés, olives, artichauts, roquette, huile de truffe', 13.90, 'pizza', true, false, 5),

-- Sides
('Frites Maison', 'Frites fraîches, sel de mer, sauce au choix', 4.50, 'side', true, false, 1),
('Onion Rings', 'Oignons panés croustillants, sauce BBQ', 5.50, 'side', true, false, 2),
('Salade César', 'Laitue romaine, parmesan, croûtons, sauce César maison', 7.90, 'side', true, false, 3),
('Nuggets de Poulet', '8 nuggets de poulet fermier, 2 sauces au choix', 6.90, 'side', true, false, 4),
('Mozzarella Sticks', '6 bâtonnets de mozzarella panés, sauce marinara', 6.50, 'side', true, false, 5),

-- Drinks
('Coca-Cola', 'Canette 33cl', 2.50, 'drink', true, false, 1),
('Sprite', 'Canette 33cl', 2.50, 'drink', true, false, 2),
('Eau Minérale', 'Bouteille 50cl', 2.00, 'drink', true, false, 3),
('Limonade Maison', 'Citron frais, menthe, sucre de canne', 3.50, 'drink', true, false, 4),
('Milkshake Vanille', 'Glace vanille, lait frais, chantilly', 5.50, 'drink', true, false, 5),
('Milkshake Chocolat', 'Glace chocolat, lait frais, chantilly', 5.50, 'drink', true, false, 6),

-- Desserts
('Brownie Chocolat', 'Brownie fondant, glace vanille, sauce chocolat', 5.90, 'dessert', true, false, 1),
('Cheesecake New York', 'Cheesecake crémeux, coulis de fruits rouges', 6.50, 'dessert', true, false, 2),
('Cookie Géant', 'Cookie aux pépites de chocolat, tiède', 3.90, 'dessert', true, false, 3),
('Tiramisu', 'Tiramisu maison, café espresso, mascarpone', 6.90, 'dessert', true, true, 4);
