// tests/e2e/homepage.spec.ts
// E2E tests for Z-Beam homepage functionality

import { test, expect } from '@playwright/test';

test.describe('Z-Beam Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/Z-Beam/i);
    
    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for main content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display company branding', async ({ page }) => {
    // Check for Z-Beam branding
    await expect(page.locator('text=Z-Beam')).toBeVisible();
    
    // Check for laser cleaning reference
    await expect(page.locator('text=Laser Cleaning')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Check main navigation links exist and are clickable
    const navLinks = [
      { text: 'Services', href: '/services' },
      { text: 'About', href: '/about' },
      { text: 'Contact', href: '/contact' }
    ];

    for (const link of navLinks) {
      const navLink = page.locator(`a[href="${link.href}"]`).first();
      await expect(navLink).toBeVisible();
      await expect(navLink).toBeEnabled();
    }
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check that content adapts to mobile
      const viewport = page.viewportSize();
      expect(viewport?.width).toBeLessThan(768);
      
      // Main content should still be visible
      await expect(page.locator('main')).toBeVisible();
      
      // Navigation should be adapted for mobile
      await expect(page.locator('nav')).toBeVisible();
    }
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check for essential meta tags
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
    
    // Check for Open Graph tags
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    await page.reload();
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);
    
    expect(jsErrors).toHaveLength(0);
  });

  test('should have fast loading performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (generous for E2E)
    expect(loadTime).toBeLessThan(5000);
  });
});
