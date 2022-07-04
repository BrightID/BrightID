import { by, element, expect } from 'detox';

import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  expectHomescreen,
  expectNotificationsScreen,
  navigateHome,
  operationTimeout,
} from './testUtils';

describe('backup', () => {
  describe('notification', () => {
    beforeAll(async () => {
      // create identity (by default without setting backup password)
      await createBrightID();
      // create a fake connection to make sure user is recorded on backend. Otherwise getUserInfo()
      // will raise 404 error on the backend and notifications will never be triggered.
      await createFakeConnection();
      // wait till connection is established
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
      await waitFor(element(by.id('connection-0')))
        .toExist()
        .withTimeout(operationTimeout);
      // back to home screen
      await navigateHome();
    });

    it('should show notification', async () => {
      // navigate from home screen to notifications
      await expectHomescreen();
      await element(by.id('notificationsBtn')).tap();
      await expectNotificationsScreen();
      // notification about social recovery should be visible
      await expect(element(by.id('BackupNotification'))).toBeVisible();
    });

    it('should navigate to TrustedConnections screen', async () => {
      // click on notification
      await element(by.id('BackupNotification')).tap();
      // should be on edit profile page
      await expect(element(by.id('editProfileScreen'))).toBeVisible();
    });
  });
});
