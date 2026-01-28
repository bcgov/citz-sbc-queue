import { test, expect } from './customAxeBuilder';

test.describe('homepage', () => {
  test('has paragraph', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Expect a title "to contain" a substring.
    await expect(page.locator('h1')).toContainText('TEST');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page, makeAxeBuilder }) => {
    await page.goto('http://localhost:3000/');

    const accessibilityScanResults = await makeAxeBuilder()
      .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
  });
});
