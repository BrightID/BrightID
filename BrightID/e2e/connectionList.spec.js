/* global element:false, by:false, waitFor:false, device: false */
import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  navigateHome,
} from './testUtils';

describe('Connection details', () => {
  beforeAll(async () => {
    // create identity
    await createBrightID();

    // create fake connection
    await createFakeConnection();

    // make sure all connections are established
    await element(by.id('connectionsBtn')).tap();
    await expectConnectionsScreen();
    await waitFor(element(by.id('connection-0')))
      .toExist()
      .withTimeout(20000);

    await navigateHome();
  });

  describe('Information', () => {
    beforeAll(async () => {
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
    });
    afterAll(async () => {
      await navigateHome();
    });

    test('should show connection name', async () => {
      await expect(element(by.id('connection_name-0'))).toBeVisible();
    });

    test('should show connection timestamp', async () => {
      await expect(element(by.id('connection_time-0'))).toBeVisible();
    });

    test('should show connection level', async () => {
      await expect(element(by.id('connection_level-0'))).toBeVisible();
    });
  });
});
