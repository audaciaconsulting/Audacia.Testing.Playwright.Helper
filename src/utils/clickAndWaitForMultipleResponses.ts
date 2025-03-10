import { Page, Locator, Response } from '@playwright/test';

interface APIRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Clicks on a specified element and waits for multiple API responses.
 * @param {Page} page - The Playwright page object.
 * @param {Locator} locatorElement - The element to click on.
 * @param {APIRequest[]} apiRequests - An array of API requests to wait for.
 * @param {number} [timeout=30000] - The maximum time to wait for the responses, in milliseconds.
 * @returns {Promise<Response[]>} - A promise that resolves to an array of responses.
 * 
 * @example
 * await clickAndWaitForMultipleResponses(
 *  sitesPage.page,
 *  sitesPage.contactNotesComponent.saveNoteButton(),
 *    [
 *      { url: '/contact-notes', method: 'POST' },
 *      { url: '/contact-notes/search', method: 'POST' },
 *    ],
 * );
 */
export async function clickAndWaitForMultipleResponses(
  page: Page,
  locatorElement: Locator,
  apiRequests: APIRequest[],
  timeout: number = 30_000,
): Promise<Response[]> {
  const responsePromises = apiRequests.map(request =>
    page.waitForResponse(
      response =>
        response.url().includes(request.url) &&
        response.request().method() === request.method,
      { timeout },
    ));

  // Click the element and wait for all responses
  await locatorElement.click();

  // Wait for all response promises to resolve
  const responses = await Promise.all(responsePromises);

  return responses;
}
