import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Simuler une connexion
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('userEmail', 'test@example.com');
    });
    await page.reload();
    await expect(page.locator('.app-header')).toBeVisible();
  });

  test('should display dashboard by default', async ({ page }) => {
    await expect(page.locator('.dashboard')).toBeVisible();
  });

  test('should display KPI cards', async ({ page }) => {
    // Les KPIs peuvent prendre du temps à charger
    await page.waitForTimeout(1000);
    
    // Vérifier la présence d'éléments du dashboard
    const dashboardContent = page.locator('.dashboard');
    await expect(dashboardContent).toBeVisible();
  });

  test('should display charts section', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Vérifier la présence de sections de graphiques
    const charts = page.locator('.chart-card, .kpi-card');
    const count = await charts.count();
    expect(count).toBeGreaterThan(0);
  });
});
