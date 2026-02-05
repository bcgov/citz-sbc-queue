import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {Result}  from 'axe-core';

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


/**
 * Given data from Axe-Core testing, parse incomplete object to determine if a violation has occurred or not.
 * See detailed information on report groups here:
 * https://docs.deque.com/devtools-for-web/4/en/java-use-results#results-overview
 *
 */
export const parseResults = (inapplicableData: Result[]) => {

  /**
   * Incomplete group - tests which ran, but the results require further (manual) review to
   * determine what category the results should ultimately fall into. A common test in this group
   * is color contrast as there is no way to set what contrast level is acceptable.
   */
  let failedColorContrast = [];

  if (inapplicableData.length > 0) {
    // Process each incomplete item to check for failed color-contrast rules
    for (const item of inapplicableData) {
      if (item.id === 'color-contrast' && item.nodes) {
        let failedNode = [];
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
                  if ((sizeInPx < 18 && contrastRatio < 4.5 ) || (sizeInPx >= 18 && contrastRatio < 3)) {
                    failedNode.push(node);
                  }
                }
              }
            }
          }
        }
        if (failedNode.length === item.nodes.length) {
          // All nodes failed, add everything to violations.
          failedColorContrast.push(item);
        }
      }
    }
  }

  return failedColorContrast;
}
