import { test, expect } from './customAxeBuilder';

test.describe('homepage', () => {
  test('has paragraph', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Expect a title "to contain" a substring.
    await expect(page.locator('h1')).toContainText('TEST');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page, makeAxeBuilder }, testInfo) => {
    await page.goto('http://localhost:3000/');

    const accessibilityScanResults = await makeAxeBuilder()
      .analyze();

    // Send test results to reporter to see more info
    await testInfo.attach('accessibility-scan-results', {
      body: JSON.stringify(accessibilityScanResults, null, 2),
      contentType: 'application/json'
    })

  expect(accessibilityScanResults.violations).toEqual([]);
  });
});
