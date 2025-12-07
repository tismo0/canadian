/**
 * Jest setup file - minimal configuration
 * Types are provided by Jest at runtime
 */

import '@testing-library/jest-dom';

// Note: jest, beforeAll, afterAll are globals provided by Jest at runtime
// TypeScript errors about them are expected in IDE but work correctly when running tests

// @ts-expect-error - jest is a global in Jest runtime
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        // @ts-expect-error - jest.fn() is available at runtime
        push: jest.fn(),
        // @ts-expect-error
        replace: jest.fn(),
        // @ts-expect-error
        refresh: jest.fn(),
        // @ts-expect-error
        back: jest.fn(),
        // @ts-expect-error
        prefetch: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// @ts-expect-error - jest is a global in Jest runtime
jest.mock('framer-motion', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    return {
        motion: {
            div: React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
                React.createElement('div', { ...props, ref })),
            button: React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
                React.createElement('button', { ...props, ref })),
            li: React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
                React.createElement('li', { ...props, ref })),
            span: React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
                React.createElement('span', { ...props, ref })),
        },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    };
});

// @ts-expect-error - jest is a global in Jest runtime
jest.mock('@/lib/supabase', () => ({
    createBrowserSupabaseClient: () => ({
        // @ts-expect-error
        from: jest.fn(() => ({
            // @ts-expect-error
            select: jest.fn().mockReturnThis(),
            // @ts-expect-error
            insert: jest.fn().mockReturnThis(),
            // @ts-expect-error
            update: jest.fn().mockReturnThis(),
            // @ts-expect-error
            delete: jest.fn().mockReturnThis(),
            // @ts-expect-error
            eq: jest.fn().mockReturnThis(),
            // @ts-expect-error
            single: jest.fn(),
        })),
        auth: {
            // @ts-expect-error
            getSession: jest.fn(),
            // @ts-expect-error
            onAuthStateChange: jest.fn(() => ({
                // @ts-expect-error
                data: { subscription: { unsubscribe: jest.fn() } }
            })),
        },
    }),
    // @ts-expect-error
    createServerSupabaseClient: jest.fn(),
}));

// Set mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
