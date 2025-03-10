import { test as base, request } from '@playwright/test';
import API from '../api/api';

// Re-exporting types and objects to streamline imports in test files
export * as ApiTypes from '@apiTypes/APISchemaTypes';
export { type Page, type BrowserContext, type TestInfo } from '@playwright/test';

// Import Page Objects
import MailtrapHelper from '@helpers/mailtrap.helper';

// Options for configuring the API request context
export type APIRequestOptions = {
  apiBaseURL: string;
  mailtrapBaseUrl: string;

};

// Custom fixtures to be used within the test context.
export type MyFixtures = {
  api: API;
  mailtrapHelper: MailtrapHelper;
};

// Extending the default test to integrate custom fixtures.
export const test = base.extend<MyFixtures & APIRequestOptions>({
  // Default configuration for the API base URL.
  apiBaseURL: ['', { option: true }],

  // Default configuration for the Mailtrap base URL.
  mailtrapBaseUrl: ['', { option: true }],

  // API context setup to use the custom API client.
  api: async ({ apiBaseURL }, use) => {
    const apiRequestContext = await request.newContext({
      baseURL: apiBaseURL,
    });
    await use(new API(apiRequestContext));
  },

  // Mailtrap context setup to use the custom Mailtrap helper.
  mailtrapHelper: async ({ mailtrapBaseUrl }, use) => {
    const apiRequestContext = await request.newContext({
      baseURL: mailtrapBaseUrl,
    });
    await use(new MailtrapHelper(apiRequestContext));
  },

  // Pages

});
