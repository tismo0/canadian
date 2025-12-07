/**
 * ProductCard Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';
import { CartProvider } from '@/contexts/cart-context';
import type { Product } from '@/types/database';

// Mock product data
const mockProduct: Product = {
    id: '1',
    name: 'Canadian Burger Classic',
    description: 'Steak haché 150g, cheddar vieilli, bacon fumé',
    price: 12.90,
    category: 'burger',
    image_url: null,
    is_available: true,
    is_featured: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

// Wrapper with providers
const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
);

describe('ProductCard', () => {
    it('renders product name and price', () => {
        render(
            <Wrapper>
                <ProductCard product={mockProduct} />
            </Wrapper>
        );

        expect(screen.getByText('Canadian Burger Classic')).toBeInTheDocument();
        expect(screen.getByText('12,90 €')).toBeInTheDocument();
    });

    it('renders product description', () => {
        render(
            <Wrapper>
                <ProductCard product={mockProduct} />
            </Wrapper>
        );

        expect(screen.getByText(/Steak haché 150g/)).toBeInTheDocument();
    });

    it('shows featured badge when product is featured', () => {
        render(
            <Wrapper>
                <ProductCard product={mockProduct} showFeatured={true} />
            </Wrapper>
        );

        expect(screen.getByText('Populaire')).toBeInTheDocument();
    });

    it('hides featured badge when showFeatured is false', () => {
        render(
            <Wrapper>
                <ProductCard product={mockProduct} showFeatured={false} />
            </Wrapper>
        );

        expect(screen.queryByText('Populaire')).not.toBeInTheDocument();
    });

    it('shows category badge', () => {
        render(
            <Wrapper>
                <ProductCard product={mockProduct} />
            </Wrapper>
        );

        expect(screen.getByText('Burger')).toBeInTheDocument();
    });

    it('shows unavailable overlay when product is not available', () => {
        const unavailableProduct = { ...mockProduct, is_available: false };

        render(
            <Wrapper>
                <ProductCard product={unavailableProduct} />
            </Wrapper>
        );

        expect(screen.getByText('Indisponible')).toBeInTheDocument();
    });

    it('has add to cart button', () => {
        render(
            <Wrapper>
                <ProductCard product={mockProduct} />
            </Wrapper>
        );

        expect(screen.getByText('Ajouter')).toBeInTheDocument();
    });

    it('links to product detail page', () => {
        render(
            <Wrapper>
                <ProductCard product={mockProduct} />
            </Wrapper>
        );

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/menu/1');
    });

    it('displays correct emoji for different categories', () => {
        const pizzaProduct = { ...mockProduct, category: 'pizza' as const };

        const { rerender } = render(
            <Wrapper>
                <ProductCard product={pizzaProduct} />
            </Wrapper>
        );

        // Check that Pizza badge is shown
        expect(screen.getByText('Pizza')).toBeInTheDocument();
    });
});
