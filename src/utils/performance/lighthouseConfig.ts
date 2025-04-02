/**
 * Defines the thresholds for different categories in Lighthouse performance testing.
 * 
 * The `lightHouseThresholds` object specifies the minimum acceptable scores for different categories in Lighthouse performance testing.
 * The categories include performance, accessibility, best practices, and SEO. You can override default value per test by using the spread operator:
 * 
 * @example
 * ```typescript
 *    await runLighthouseAudit(
 *      page,
 *      port,
 *      testInfo,
 *      { ...lightHouseThresholds, seo: 40 },
 *    );
 *  });
 * ```
 */
export const lightHouseThresholds = {
  performance: 50,
  accessibility: 50,
  'best-practices': 90,
  seo: 50,
};
