/**
 * Supabase client configuration
 * Provides both browser and server-side clients
 */

import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/database';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

/**
 * Create a Supabase client for browser-side usage
 * Uses anon key, respects RLS policies
 */
export function createBrowserSupabaseClient() {
    return createBrowserClient<Database>(
        supabaseUrl!,
        supabaseAnonKey!
    );
}

/**
 * Create a Supabase client for server-side usage (in Server Components, Route Handlers)
 * Handles cookies for auth session management
 */
export async function createServerSupabaseClient() {
    // Dynamic import to avoid bundling in client components
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    return createServerClient<Database>(
        supabaseUrl!,
        supabaseAnonKey!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch {
                        // Handle cookie setting in Server Components (read-only)
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch {
                        // Handle cookie removal in Server Components (read-only)
                    }
                },
            },
        }
    );
}

/**
 * Create a Supabase admin client with service role key
 * Bypasses RLS - use only in secure server-side contexts!
 */
export function createAdminSupabaseClient() {
    if (!supabaseServiceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    return createClient<Database>(
        supabaseUrl!,
        supabaseServiceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

/**
 * Get the current user's profile
 */
export async function getCurrentProfile() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const supabase = await createServerSupabaseClient();
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return profile;
}

/**
 * Check if current user has admin role
 */
export async function isAdmin() {
    const profile = await getCurrentProfile();
    return profile?.role === 'admin';
}

/**
 * Check if current user has staff or admin role
 */
export async function isStaff() {
    const profile = await getCurrentProfile();
    return profile?.role === 'staff' || profile?.role === 'admin';
}
