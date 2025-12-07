/**
 * Cart Context - Global shopping cart state management
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import type { Product, CartItem } from '@/types/database';

// Cart state
interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

// Cart actions
type CartAction =
    | { type: 'ADD_ITEM'; product: Product; quantity?: number; notes?: string }
    | { type: 'REMOVE_ITEM'; productId: string }
    | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
    | { type: 'UPDATE_NOTES'; productId: string; notes: string }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_CART' }
    | { type: 'OPEN_CART' }
    | { type: 'CLOSE_CART' }
    | { type: 'LOAD_CART'; items: CartItem[] };

// Initial state
const initialState: CartState = {
    items: [],
    isOpen: false,
};

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingIndex = state.items.findIndex(
                item => item.product.id === action.product.id
            );

            if (existingIndex >= 0) {
                // Update existing item quantity
                const newItems = [...state.items];
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: newItems[existingIndex].quantity + (action.quantity ?? 1),
                };
                return { ...state, items: newItems };
            }

            // Add new item
            return {
                ...state,
                items: [
                    ...state.items,
                    {
                        product: action.product,
                        quantity: action.quantity ?? 1,
                        notes: action.notes,
                    },
                ],
            };
        }

        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.product.id !== action.productId),
            };

        case 'UPDATE_QUANTITY': {
            if (action.quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter(item => item.product.id !== action.productId),
                };
            }

            return {
                ...state,
                items: state.items.map(item =>
                    item.product.id === action.productId
                        ? { ...item, quantity: action.quantity }
                        : item
                ),
            };
        }

        case 'UPDATE_NOTES':
            return {
                ...state,
                items: state.items.map(item =>
                    item.product.id === action.productId
                        ? { ...item, notes: action.notes }
                        : item
                ),
            };

        case 'CLEAR_CART':
            return { ...state, items: [] };

        case 'TOGGLE_CART':
            return { ...state, isOpen: !state.isOpen };

        case 'OPEN_CART':
            return { ...state, isOpen: true };

        case 'CLOSE_CART':
            return { ...state, isOpen: false };

        case 'LOAD_CART':
            return { ...state, items: action.items };

        default:
            return state;
    }
}

// Context type
interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    itemCount: number;
    subtotal: number;
    addItem: (product: Product, quantity?: number, notes?: string) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updateNotes: (productId: string, notes: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
}

// Create context
const CartContext = createContext<CartContextType | null>(null);

// Local storage key
const CART_STORAGE_KEY = 'canadian-burger-cart';

// Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    dispatch({ type: 'LOAD_CART', items: parsed });
                }
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }, [state.items]);

    // Memoized computed values
    const itemCount = useMemo(
        () => state.items.reduce((sum, item) => sum + item.quantity, 0),
        [state.items]
    );

    const subtotal = useMemo(
        () => state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        [state.items]
    );

    // Memoized actions
    const addItem = useCallback(
        (product: Product, quantity?: number, notes?: string) => {
            dispatch({ type: 'ADD_ITEM', product, quantity, notes });
        },
        []
    );

    const removeItem = useCallback((productId: string) => {
        dispatch({ type: 'REMOVE_ITEM', productId });
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
    }, []);

    const updateNotes = useCallback((productId: string, notes: string) => {
        dispatch({ type: 'UPDATE_NOTES', productId, notes });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const toggleCart = useCallback(() => {
        dispatch({ type: 'TOGGLE_CART' });
    }, []);

    const openCart = useCallback(() => {
        dispatch({ type: 'OPEN_CART' });
    }, []);

    const closeCart = useCallback(() => {
        dispatch({ type: 'CLOSE_CART' });
    }, []);

    const value: CartContextType = {
        items: state.items,
        isOpen: state.isOpen,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook for using cart context
export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }

    return context;
}
