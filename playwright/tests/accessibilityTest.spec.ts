import { test, parseResults } from './customAxeBuilder';
import { expect } from '@playwright/test';
import { createHtmlReport } from 'axe-html-reporter';

const reportDir = 'playwright/report';

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

      const accessibilityScanResults = await makeAxeBuilder()
        .analyze();

      // If there are incomplete tests get better error to write to report and console
      if (accessibilityScanResults.incomplete.length > 0) {

        const failedColorContrast = parseResults(accessibilityScanResults.incomplete);
        console.log(`Found ${failedColorContrast.length} color-contrast issues that need review.`);

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
          outputDirPath: `./playwright/report/accessibility/`
        },
      });
      console.log(`should save to ${reportDir}/${name}.html`);

      // OPTIONAL: Write report to Playwright HTML report.
      // Send test results to reporter to see more info
      await testInfo.attach('accessibility-scan-results', {
        body: reportHTML,
        contentType: 'text/html'
      })

      expect.soft(accessibilityScanResults.violations.length).toEqual(0);

    });
  });
});
