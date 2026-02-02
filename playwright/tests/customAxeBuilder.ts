import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { parse } from 'path';

type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

// Extend base test by providing "makeAxeBuilder"
//
// This new "test" can be used in multiple test files, and each of them will get
// a consistently configured AxeBuilder instance.
export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () => new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']);

    await use(makeAxeBuilder);
  }
});

type nodeItem = {
  any?: { id: string; data?: { fontSize: string; contrastRatio: number } }[];
}

type incompleteItem = {
  id: string;
  nodes: nodeItem[];
}

type AxeResult = {
  inapplicable: object[];
  passes: object[];
  violations: object[];
  incomplete: incompleteItem[];
};

/**
 * Given a playwright JSON scan result parse and return only useful data. Information for each
 * group is from https://docs.deque.com/devtools-for-web/4/en/java-use-results#results-overview
 *
 */
export const parseResults = (jsonData: AxeResult) => {
  const {inapplicable, passes, violations, incomplete} = jsonData;

  /**
   * Passed group - tests which ran and passed successfully. Can update the following to not
   * report on information on passed tests.
   */
  const passedStr = `${passes.length} accessibility checks passed.`;

  /**
   * Incomplete group - tests which ran, but the results require further (manual) review to
   * determine what category the results should ultimately fall into. A common test in this group
   * is color contrast as there is no way to set what contrast level is acceptable.
   */
  let failedColorContrast = [];

  if (incomplete.length > 0) {
    // Process each incomplete item to check for failed color-contrast rules
    for (const item of incomplete) {
      if (item.id === 'color-contrast' && item.nodes) {
        // Review each node in the color-contrast rule
        for (const node of item.nodes) {
          if (node.any && Array.isArray(node.any)) {
            for (const check of node.any) {
              if (check.id === 'color-contrast' && check.data) {
                const { fontSize, contrastRatio } = check.data;

                // Extract pixel size from fontSize (e.g., "12.0pt (16px)" -> 16)
                const fontSizeMatch = fontSize.match(/\((\d+)px\)/);
                const sizeInPx = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : null;

                if (sizeInPx !== null && contrastRatio !== null) {
                  const isNormalText = sizeInPx < 18;
                  const isLargeText = sizeInPx >= 18;

                  // Check if contrast ratio fails for the size category
                  const failsLargeText = isLargeText && contrastRatio < 3;
                  const failsNormalText = isNormalText && contrastRatio < 4.5;

                  if (failsLargeText || failsNormalText) {
                    failedColorContrast.push({
                      ...node,
                      contrastData: check.data,
                      sizeInPx,
                      failureReason: failsLargeText
                        ? `Large text (${sizeInPx}px) has contrast ${contrastRatio} < 3:1`
                        : `Normal text (${sizeInPx}px) has contrast ${contrastRatio} < 4.5:1`
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  let incompleteStr = '';
  if (incomplete.length - failedColorContrast.length > 0 ) {
    incompleteStr = `${incomplete.length} accessibility checks require further review.`;
  }

  /**
   * Violation group - all the accessibility violations found in the scan.
   */
  let violationStr = '';
  if (violations.length + failedColorContrast.length > 0) {
    violationStr = `${violations.length + failedColorContrast.length} accessibility violations found.`;
  } else {
    violationStr = 'No accessibility violations found.';
  }

  /**
   * Inapplicable group - no page content relevant to that particular test,
   *  such as form related tests on a page with no forms. Only included if there are any.
   */
  let inapplicableStr = ``;
  if (inapplicable.length > 0) {
    inapplicableStr = `${inapplicable.length} tests were applied but not relevant to the page content.`;
  }


  const parsedResults = {
    passed: passedStr,
    incomplete: incompleteStr,
    violation: violationStr,
    inapplicable: inapplicableStr
  }

  return parsedResults;
}
