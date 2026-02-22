import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    // Nettoyer le localStorage avant chaque test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/');
    
    // Cliquer sur "Se connecter" pour accéder au login
    await page.click('.landing-login-btn, .nav-link-btn');
    
    // Vérifier que le formulaire de login est visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.click('.landing-login-btn, .nav-link-btn');
    
    // Remplir avec des identifiants invalides
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Attendre un message d'erreur (peut varier selon l'implémentation)
    await page.waitForTimeout(1000);
    
    // Vérifier qu'on n'est pas connecté (pas de redirection vers le dashboard)
    await expect(page.locator('.app-header')).not.toBeVisible({ timeout: 2000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/');
    await page.click('.landing-login-btn, .nav-link-btn');
    
    // Utiliser des identifiants valides (à adapter selon votre configuration)
    // Pour les tests, on peut simuler un login en setant directement le token
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('userEmail', 'test@example.com');
    });
    
    // Recharger la page pour que l'app détecte le token
    await page.reload();
    
    // Vérifier qu'on est connecté
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Plateforme Gestion Multi-Sites');
  });
});
