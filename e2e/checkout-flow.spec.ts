/**
 * E2E Test: Complete Order Flow
 * Tests the full customer journey from browsing to checkout
 */

import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to homepage
        await page.goto('/');
    });

    test('should display homepage hero section', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('burgers');
        await expect(page.getByRole('link', { name: /commander/i })).toBeVisible();
    });

    test('should navigate to menu page', async ({ page }) => {
        await page.getByRole('link', { name: /voir le menu/i }).first().click();
        await expect(page).toHaveURL('/menu');
        await expect(page.locator('h1')).toContainText('menu');
    });

    test('should filter products by category', async ({ page }) => {
        await page.goto('/menu');

        // Click on burger category
        await page.getByRole('link', { name: /burgers/i }).click();
        await expect(page).toHaveURL(/category=burger/);
    });

    test('should add product to cart', async ({ page }) => {
        await page.goto('/menu');

        // Find first add to cart button and click it
        const addButtons = page.getByRole('button', { name: /ajouter/i });
        await addButtons.first().click();

        // Check cart badge shows 1
        await expect(page.locator('[aria-label*="Panier"]')).toBeVisible();
    });

    test('should open cart drawer when clicking cart icon', async ({ page }) => {
        await page.goto('/menu');

        // Add a product first
        await page.getByRole('button', { name: /ajouter/i }).first().click();

        // Cart drawer should be visible
        await expect(page.getByTestId('cart-drawer')).toBeVisible();
    });

    test('should update quantity in cart', async ({ page }) => {
        await page.goto('/menu');

        // Add a product
        await page.getByRole('button', { name: /ajouter/i }).first().click();

        // Find increment button in cart and click
        await page.getByRole('button', { name: /augmenter/i }).click();

        // Check quantity is 2
        await expect(page.getByTestId('item-quantity')).toHaveText('2');
    });

    test('should navigate to cart page', async ({ page }) => {
        await page.goto('/menu');

        // Add a product
        await page.getByRole('button', { name: /ajouter/i }).first().click();

        // Click on "Voir le panier"
        await page.getByRole('link', { name: /voir le panier/i }).click();

        await expect(page).toHaveURL('/cart');
    });

    test('should navigate to checkout from cart', async ({ page }) => {
        await page.goto('/menu');

        // Add a product
        await page.getByRole('button', { name: /ajouter/i }).first().click();

        // Close cart and go to cart page
        await page.goto('/cart');

        // Click checkout button
        await page.getByRole('link', { name: /passer la commande/i }).click();

        await expect(page).toHaveURL('/checkout');
    });

    test('should show form validation errors on checkout', async ({ page }) => {
        await page.goto('/menu');

        // Add a product
        await page.getByRole('button', { name: /ajouter/i }).first().click();
        await page.goto('/checkout');

        // Try to submit empty form
        await page.getByRole('button', { name: /payer/i }).click();

        // Should show validation (browser native or custom)
        // The form should not submit with empty required fields
        await expect(page).toHaveURL('/checkout');
    });

    test('should fill checkout form correctly', async ({ page }) => {
        await page.goto('/menu');

        // Add a product
        await page.getByRole('button', { name: /ajouter/i }).first().click();
        await page.goto('/checkout');

        // Fill form
        await page.fill('#customer_name', 'Jean Test');
        await page.fill('#customer_email', 'jean@test.be');
        await page.fill('#customer_phone', '+32470123456');

        // Check values are set
        await expect(page.locator('#customer_name')).toHaveValue('Jean Test');
        await expect(page.locator('#customer_email')).toHaveValue('jean@test.be');
    });

    test('should show empty cart message', async ({ page }) => {
        await page.goto('/cart');

        await expect(page.locator('text=Votre panier est vide')).toBeVisible();
        await expect(page.getByRole('link', { name: /voir le menu/i })).toBeVisible();
    });
});

test.describe('Navigation', () => {
    test('should have working navigation links', async ({ page }) => {
        await page.goto('/');

        // Test menu link
        await page.getByRole('link', { name: 'Menu' }).first().click();
        await expect(page).toHaveURL('/menu');

        // Test home link (logo)
        await page.getByRole('link', { name: /canadian burger/i }).first().click();
        await expect(page).toHaveURL('/');
    });

    test('should open mobile menu on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Click hamburger menu
        await page.getByRole('button', { name: 'Menu' }).click();

        // Mobile menu should be visible
        await expect(page.locator('nav').getByRole('link', { name: 'Menu' })).toBeVisible();
    });
});

test.describe('Product Detail', () => {
    test('should navigate to product detail page', async ({ page }) => {
        await page.goto('/menu');

        // Click on first product card
        await page.locator('[data-testid="product-card"]').first().click();

        // Should be on product detail page
        await expect(page).toHaveURL(/\/menu\/[a-f0-9-]+/);
    });

    test('should add product with quantity from detail page', async ({ page }) => {
        await page.goto('/menu');

        // Go to product detail
        await page.locator('[data-testid="product-card"]').first().click();

        // Increase quantity
        await page.getByRole('button', { name: /augmenter/i }).click();

        // Add to cart
        await page.getByRole('button', { name: /ajouter au panier/i }).click();

        // Should show success state
        await expect(page.getByText('Ajouté!')).toBeVisible();
    });
});

test.describe('Responsive Design', () => {
    const viewports = [
        { width: 375, height: 667, name: 'iPhone SE' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1440, height: 900, name: 'Desktop' },
    ];

    for (const viewport of viewports) {
        test(`should display correctly on ${viewport.name}`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');

            // Hero should be visible
            await expect(page.locator('h1')).toBeVisible();

            // CTA should be visible
            await expect(page.getByRole('link', { name: /commander/i }).first()).toBeVisible();
        });
    }
});
