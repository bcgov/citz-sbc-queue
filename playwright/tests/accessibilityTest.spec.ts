import { test, expect } from './customAxeBuilder';
import { createHtmlReport } from 'axe-html-reporter';
import fs from 'fs';

const reportDir = 'playwright/report/accessibility/';

// List of URLS to check for accessibility
// may have to work on this to get a way to log in first
const urlsToCheck = [
    {
        url: 'http://localhost:3000/',
        name: 'Homepage',
    },
];

test.describe('Accessibility Testing', () => {
  urlsToCheck.forEach(({ url, name }) => {

    test(`should pass accessibility tags: ${url}`, async ({ page, makeAxeBuilder }, testInfo) => {
      await page.goto(url);
      const reportName = `${name}.html`;

      const accessibilityScanResults = await makeAxeBuilder()
        .analyze();

      const reportHTML = createHtmlReport({
        results: accessibilityScanResults,
        options: {
          outputDir: reportDir,
          reportFileName: reportName,
        },
      });

      const reportPath = `${reportDir}${reportName}`

      // Save HTML report to a file
      if (!fs.existsSync(reportPath)) {
          fs.mkdirSync(reportPath, { recursive: true });
      }
      fs.writeFileSync(reportPath, reportHTML);

      // OPTIONAL: Write report to Playwright HTML report.
      // Send test results to reporter to see more info
      await testInfo.attach('accessibility-scan-results', {
        path: reportPath,
      })

    expect.soft(accessibilityScanResults.violations).toEqual([]);
    expect.soft(accessibilityScanResults.incomplete).toEqual([]);
    });
  });
});
