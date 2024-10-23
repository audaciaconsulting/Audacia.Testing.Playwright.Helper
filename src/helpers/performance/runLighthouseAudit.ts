import { test, expect, Page, TestInfo } from '@playwright/test';
import { lightHouseThresholds } from './lighthouseConfig.js';
import path from 'path';

/**
 * Runs a Lighthouse audit on a given page and attaches the report to the test results.
 * 
 * @param page - The Playwright Page object to run the audit on
 * @param port - The port number the page is running on
 * @param testInfo - TestInfo object from Playwright for attaching reports
 * @param thresholds - Optional. Thresholds for Lighthouse metrics (default: lightHouseThresholds)
 * @param opts - Optional. Additional Lighthouse options
 */
export async function runLighthouseAudit(
  page: Page,
  port: number,
  testInfo: TestInfo,
  thresholds = lightHouseThresholds,
  opts?: Record<string, any>
) {

  const reportDirectory = path.join(process.cwd(), 'playwright-lighthouse-report', testInfo.testId);
  const reportName = 'lighthouse-report.html';

  // Dynamically import playAudit
  const { playAudit } = await import('playwright-lighthouse');

  // Step 1: Run the Lighthouse audit
  await test.step('Run Lighthouse audit', async () => {
    try {
      await playAudit({
        page: page,
        port: port,
        thresholds,
        opts: opts,
        reports: {
          formats: { html: true, json: true },
          directory: reportDirectory,
          name: reportName,
        },
      });
    } catch (error) {
      // Soft assertion to log the error and allow the test to continue
      if (error instanceof Error) {
        expect.soft(error.message, 'Lighthouse audit failed.').toBeNull();
      } else {
        expect.soft('Unknown error', 'Lighthouse audit failed.').toBeNull();
      }
    }
  });

  // Step 2: Attach the Lighthouse report to the test results
  await test.step('Attach Lighthouse report', async () => {
    try {
      await testInfo.attach(reportName, {
        path: path.join(reportDirectory, reportName),
        contentType: 'text/html',
      });
    } catch (attachError) {
      console.error('Attachment failed: ', attachError);
    }
  });
}
