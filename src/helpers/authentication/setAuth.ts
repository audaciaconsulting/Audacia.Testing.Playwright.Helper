import { BrowserContext, Page } from '@playwright/test';

/**
 * Retrieve the base URL for the application from environment variable,
 * used to determine the domain to set the session storage for.
 */
const baseURL = process.env.BASE_URL;

/**
 * Initialise the session storage key, which will be used to store user authentication data with.
 * Find the key by inspecting the application's session storage manually.
 */
const sessionStorageKey = '';

/**
 * Sets the session storage for a given page or context.
 * 
 * @param {Page | BrowserContext} pageOrContext - The page or context to set the session storage for.
 * @param {any} userAuthData - The user authentication data to be stored in the session storage.
 * @returns {Promise<void>} - A promise that resolves when the session storage is set.
 */
export async function setSession(pageOrContext: Page | BrowserContext, userAuthData: any): Promise<void> {

  // Set session storage in our context or page
  await pageOrContext.addInitScript(({ storageData, domain }) => {
    // Only set session storage if the page is from the application
    if (window.location.hostname === domain) {
      window.sessionStorage.setItem(sessionStorageKey, JSON.stringify(storageData));
    }
  }, { storageData: userAuthData, domain: baseURL ? new URL(baseURL).hostname : '' });
}

/**
 * Sets the local storage with authentication data. 
 * Only use this function if you are unable to use:
 * `test.use({ storageState: './.auth/user.json' });` in your test file.
 * 
 * @param {Page} page - The page to set the local storage on.
 * @returns {Promise<void>} - A promise that resolves when the local storage is set.
 */
export async function setLocalStorage(page: Page, userAuthData: any): Promise<void> {
  // Set local storage.
  await page.evaluate((authFile) => {
    // Set local storage items for each origin
    authFile.origins.forEach((origin: { localStorage: any[]; }) => {
      // Set each local storage item for the origin
      origin.localStorage.forEach((item) => {
        localStorage.setItem(item.name, item.value);
      });
    });
  }, userAuthData);
}
