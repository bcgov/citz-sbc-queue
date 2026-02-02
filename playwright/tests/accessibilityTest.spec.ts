import { test, parseResults } from './customAxeBuilder';
import { expect } from '@playwright/test';
import { createHtmlReport } from 'axe-html-reporter';
import fs from 'fs';


const reportDir = 'playwright/report/accessibility';

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

      const reportHTML = createHtmlReport({
        results: accessibilityScanResults,
        options: {
          doNotCreateReportFile:true,
          // If you want to save the report to a file uncomment below and comment out the above line
          // outputDir: reportDir,
          // reportFileName: `${name}.html`,
        },
      });

      // Uncomment if you want to save HTML report to a file

      // const reportPath = `${reportDir}${name}.html`;
      // if (!fs.existsSync(reportPath)) {
      //     fs.mkdirSync(reportPath, { recursive: true });
      // }
      // fs.writeFileSync(reportPath, reportHTML);

      // OPTIONAL: Write report to Playwright HTML report.
      // Send test results to reporter to see more info
      await testInfo.attach('accessibility-scan-results', {
        body: reportHTML,
        contentType: 'text/html'
      })

      // Get better error to write to report and console
      const accessibilityReport = parseResults(accessibilityScanResults);

      expect.soft(accessibilityReport.violation).toEqual('No accessibility violations found.');
    });
  });
});
