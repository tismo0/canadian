/**
 * Cart Context Tests
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/contexts/cart-context';
import type { Product } from '@/types/database';

// Mock product
const mockProduct: Product = {
    id: '1',
    name: 'Test Burger',
    description: 'A test burger',
    price: 10.00,
    category: 'burger',
    image_url: null,
    is_available: true,
    is_featured: false,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

const mockProduct2: Product = {
    ...mockProduct,
    id: '2',
    name: 'Test Pizza',
    price: 15.00,
    category: 'pizza',
};

// Test component that uses the cart
function TestComponent() {
    const {
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
    } = useCart();

    return (
        <div>
            <div data-testid="item-count">{itemCount}</div>
            <div data-testid="subtotal">{subtotal}</div>
            <div data-testid="items-length">{items.length}</div>

            <button onClick={() => addItem(mockProduct)}>Add Burger</button>
            <button onClick={() => addItem(mockProduct2, 2)}>Add 2 Pizzas</button>
            <button onClick={() => removeItem('1')}>Remove Burger</button>
            <button onClick={() => updateQuantity('1', 5)}>Set Qty 5</button>
            <button onClick={() => clearCart()}>Clear Cart</button>

            {items.map(item => (
                <div key={item.product.id} data-testid={`item-${item.product.id}`}>
                    {item.product.name}: {item.quantity}
                </div>
            ))}
        </div>
    );
}

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Cart Context', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('starts with empty cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
        expect(screen.getByTestId('subtotal')).toHaveTextContent('0');
    });

    it('adds item to cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        fireEvent.click(screen.getByText('Add Burger'));

        expect(screen.getByTestId('item-count')).toHaveTextContent('1');
        expect(screen.getByTestId('subtotal')).toHaveTextContent('10');
        expect(screen.getByTestId('item-1')).toHaveTextContent('Test Burger: 1');
    });

    it('adds multiple items with quantity', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        fireEvent.click(screen.getByText('Add 2 Pizzas'));

        expect(screen.getByTestId('item-count')).toHaveTextContent('2');
        expect(screen.getByTestId('subtotal')).toHaveTextContent('30'); // 15 * 2
    });

    it('increments quantity when adding same product', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        fireEvent.click(screen.getByText('Add Burger'));
        fireEvent.click(screen.getByText('Add Burger'));

        expect(screen.getByTestId('item-count')).toHaveTextContent('2');
        expect(screen.getByTestId('items-length')).toHaveTextContent('1');
        expect(screen.getByTestId('item-1')).toHaveTextContent('Test Burger: 2');
    });

    it('removes item from cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        fireEvent.click(screen.getByText('Add Burger'));
        expect(screen.getByTestId('item-count')).toHaveTextContent('1');

        fireEvent.click(screen.getByText('Remove Burger'));
        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });

    it('updates quantity', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        fireEvent.click(screen.getByText('Add Burger'));
        fireEvent.click(screen.getByText('Set Qty 5'));

        expect(screen.getByTestId('item-count')).toHaveTextContent('5');
        expect(screen.getByTestId('subtotal')).toHaveTextContent('50'); // 10 * 5
    });

    it('clears cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        fireEvent.click(screen.getByText('Add Burger'));
        fireEvent.click(screen.getByText('Add 2 Pizzas'));
        expect(screen.getByTestId('item-count')).toHaveTextContent('3');

        fireEvent.click(screen.getByText('Clear Cart'));
        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
        expect(screen.getByTestId('items-length')).toHaveTextContent('0');
    });

    it('calculates subtotal correctly with multiple products', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        fireEvent.click(screen.getByText('Add Burger')); // 10
        fireEvent.click(screen.getByText('Add 2 Pizzas')); // 30

        expect(screen.getByTestId('subtotal')).toHaveTextContent('40');
    });
});
