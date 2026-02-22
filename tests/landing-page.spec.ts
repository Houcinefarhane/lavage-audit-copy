import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display landing page when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier que la landing page est affichée
    await expect(page.locator('.landing-page')).toBeVisible();
    await expect(page.locator('.brand-name')).toContainText('Audit Lavage');
    await expect(page.locator('.hero-title')).toBeVisible();
  });

  test('should navigate to login when clicking "Se connecter"', async ({ page }) => {
    await page.goto('/');
    
    // Cliquer sur le bouton "Se connecter" dans le header
    await page.click('.landing-login-btn, .nav-link-btn');
    
    // Vérifier que l'écran de login est affiché
    await expect(page.locator('.login-container, .login-form')).toBeVisible();
  });

  test('should navigate to login when clicking CTA button', async ({ page }) => {
    await page.goto('/');
    
    // Cliquer sur le bouton principal "Accéder à la plateforme"
    await page.click('.btn-hero-primary');
    
    // Vérifier que l'écran de login est affiché
    await expect(page.locator('.login-container, .login-form')).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');
    
    // Scroller jusqu'à la section features
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    // Vérifier que les features sont affichées
    await expect(page.locator('.features-title')).toBeVisible();
    await expect(page.locator('.feature-card')).toHaveCount(1); // Seulement Audits Qualité maintenant
  });
});
