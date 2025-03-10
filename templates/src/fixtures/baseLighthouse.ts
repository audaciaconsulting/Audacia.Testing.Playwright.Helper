import { test as base } from './baseTest';

// Import Page Objects
import getPort from 'get-port';

// Custom fixtures to be used within the test context.
export type MyFixtures = {
  port: number;
};

// Extending the default test to integrate custom fixtures.
export const test = base.extend<MyFixtures>({

  // Custom fixture to get a random port number.
  port: [
    async ({ }, use) => {
      const port = await getPort();
      await use(port);
    },
    { scope: 'test' },
  ],
});
