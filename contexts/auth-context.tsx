/**
 * Auth Context - Authentication state management with Supabase
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

// Auth state
interface AuthState {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
}

// Auth context type
interface AuthContextType extends AuthState {
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Initial state
const initialState: AuthState = {
    user: null,
    profile: null,
    session: null,
    loading: true,
};

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>(initialState);
    const supabase = createBrowserSupabaseClient();

    // Fetch user profile
    const fetchProfile = useCallback(async (userId: string) => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return profile;
    }, [supabase]);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    setState({
                        user: session.user,
                        profile,
                        session,
                        loading: false,
                    });
                } else {
                    setState({ ...initialState, loading: false });
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setState({ ...initialState, loading: false });
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    setState(prev => ({
                        ...prev,
                        user: session.user,
                        profile,
                        session,
                        loading: false,
                    }));
                } else if (event === 'SIGNED_OUT') {
                    setState({ ...initialState, loading: false });
                } else if (event === 'TOKEN_REFRESHED' && session) {
                    setState(prev => ({ ...prev, session }));
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile]);

    // Sign in with email/password
    const signIn = useCallback(async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true }));

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setState(prev => ({ ...prev, loading: false }));
        }

        return { error };
    }, [supabase]);

    // Sign up with email/password
    const signUp = useCallback(async (email: string, password: string, fullName: string) => {
        setState(prev => ({ ...prev, loading: true }));

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            setState(prev => ({ ...prev, loading: false }));
        }

        return { error };
    }, [supabase]);

    // Sign out
    const signOut = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));
        await supabase.auth.signOut();
        setState({ ...initialState, loading: false });
    }, [supabase]);

    // Refresh profile
    const refreshProfile = useCallback(async () => {
        if (state.user) {
            const profile = await fetchProfile(state.user.id);
            setState(prev => ({ ...prev, profile }));
        }
    }, [state.user, fetchProfile]);

    // Update profile
    const updateProfile = useCallback(async (data: Partial<Profile>) => {
        if (!state.user) {
            return { error: new Error('Not authenticated') };
        }

        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', state.user.id);

        if (!error) {
            await refreshProfile();
        }

        return { error: error ? new Error(error.message) : null };
    }, [supabase, state.user, refreshProfile]);

    const value: AuthContextType = {
        ...state,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for using auth context
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

// Hook for requiring authentication
export function useRequireAuth(redirectTo = '/login') {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.loading && !auth.user) {
            window.location.href = redirectTo;
        }
    }, [auth.loading, auth.user, redirectTo]);

    return auth;
}

// Hook for requiring admin role
export function useRequireAdmin(redirectTo = '/') {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.loading) {
            if (!auth.user) {
                window.location.href = '/login';
            } else if (auth.profile?.role !== 'admin') {
                window.location.href = redirectTo;
            }
        }
    }, [auth.loading, auth.user, auth.profile, redirectTo]);

    return auth;
}
