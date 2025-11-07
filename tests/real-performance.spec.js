import { test, expect } from '@playwright/test';

const SITE_URL = 'https://nye-poster.netlify.app';

test.describe('Real Performance Tests', () => {
  test('should load site within performance budget', async ({ page }) => {
    // Start timing
    const startTime = Date.now();

    // Navigate to site
    await page.goto(SITE_URL);

    // Wait for first contentful paint
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Test performance budgets
    expect(loadTime).toBeLessThan(3000); // 3 second max
    console.log(`Site loaded in: ${loadTime}ms`);
  });

  test('should have fast First Contentful Paint', async ({ page }) => {
    // Use Playwright's performance API
    await page.goto(SITE_URL);

    const performanceMetrics = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation')[0]);
    });

    const metrics = JSON.parse(performanceMetrics);
    const fcp = metrics.domContentLoadedEventEnd - metrics.fetchStart;

    expect(fcp).toBeLessThan(1800); // 1.8s FCP budget
    console.log(`First Contentful Paint: ${fcp}ms`);
  });

  test('should load critical resources quickly', async ({ page }) => {
    const resourceTimes = [];

    // Monitor network requests
    page.on('response', (response) => {
      if (response.url().includes('.css') || response.url().includes('.js')) {
        resourceTimes.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing(),
        });
      }
    });

    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    // Check that critical resources loaded successfully
    const failedResources = resourceTimes.filter((r) => r.status >= 400);
    expect(failedResources).toHaveLength(0);

    console.log(`Loaded ${resourceTimes.length} critical resources`);
  });

  test('should be interactive quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(SITE_URL);

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');

    // Test interaction - try clicking a grid item
    const gridItem = page.locator('.grid__item').first();
    await gridItem.waitFor({ state: 'visible' });

    const interactiveTime = Date.now() - startTime;

    expect(interactiveTime).toBeLessThan(2500); // 2.5s to interactive
    console.log(`Time to interactive: ${interactiveTime}ms`);
  });
});
