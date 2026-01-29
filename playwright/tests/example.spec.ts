import { test, expect } from '@playwright/test';

/**
 * Example test that doesn't use the Axe Builder
 */

test.describe('homepage', () => {
  test('has paragraph', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Expect a title "to contain" a substring.
    // Can test how failing tests are reported by changing 'h1' or 'TEST' here to any other string
    await expect(page.locator('h1')).toContainText('TEST');
  });
});
