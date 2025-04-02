import { Locator, Page, Response } from '@playwright/test';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Clicks on an element identified by the given locator and waits for a response with the specified URL.
 * @param {Page} page - The Playwright page object.
 * @param {string} locatorElement - The locator to identify the element to click.
 * @param {string} url - The URL to wait for a response from. (You can use a partial URL.)
 * @param {RequestMethod} requestMethod - The request method to wait for.
 * @returns {Promise<Response>} - A promise that resolves to the response received after clicking the element.
 * 
 * @example
 * await clickAndWaitForResponse(
 *  sitesPage.page,
 *  sitesPage.contactNotesComponent.notifyUserModalSubmitButton(),
 *  '/contact-notes/notify',
 *  'POST',
 * );
 */
export async function clickAndWaitForResponse(
  page: Page,
  locatorElement: Locator,
  url: string,
  requestMethod: RequestMethod,
  timeout: number = 30_000,
): Promise<Response> {
  const waitForResponse = page.waitForResponse(
    (response) =>
      response.url().includes(url) &&
      response.request().method() === requestMethod,
    { timeout },
  );
  await locatorElement.click();
  const response = await waitForResponse;

  return response;
}
