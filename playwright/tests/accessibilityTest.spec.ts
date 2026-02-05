import { test, parseResults } from './customAxeBuilder';
import { expect } from '@playwright/test';
import { createHtmlReport } from 'axe-html-reporter';

// List of URLS to check for accessibility
// may have to work on this to get a way to log in first
const urlsToCheck = [
    {
        url: '/',
        name: 'Homepage',
    },
];

test.describe('Accessibility Testing', () => {
  urlsToCheck.forEach(({ url, name }) => {

    test(`should raise no accessibility violations: ${url} ${name}`, async ({ page, makeAxeBuilder }, testInfo) => {
      await page.goto(url);

      const accessibilityScanResults = await makeAxeBuilder()
        .analyze();

      // If there are incomplete tests get better error to write to report and console
      if (accessibilityScanResults.incomplete.length > 0) {

        const failedColorContrast = parseResults(accessibilityScanResults.incomplete);

        if (failedColorContrast.length != accessibilityScanResults.incomplete.length) {
          // if not all the incomplete tests were color-contrast failures, report them as violations
          expect.soft(accessibilityScanResults.incomplete.length).toEqual(0);
        } else {
        // add failed colour contrast tests to violations for reporting
        accessibilityScanResults.violations.push(...failedColorContrast);
        accessibilityScanResults.incomplete = [];
      }

      }

      const reportHTML = createHtmlReport({
        results: accessibilityScanResults,
        options: {
          // comment out this line if you want to have a report file created locally
          doNotCreateReportFile:true,
          // uncomment these lines if you want to have a report file created locally
          reportFileName: `${name}.html`,
          outputDir: `playwright/test-results/accessibility-reports/`,
        },
      });

      // Send test results to reporter to see more info
      await testInfo.attach('accessibility-scan-results', {
        body: reportHTML,
        contentType: 'text/html'
      })

      expect.soft(accessibilityScanResults.violations.length).toEqual(0);

    });
  });
});
