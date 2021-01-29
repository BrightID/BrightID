// @flow
/* global device:false, element:false, by:false, waitFor:false */

import {
  createBrightID,
  createFakeConnection,
  expectHomescreen,
  expectNotificationsScreen,
} from './testUtils';

describe('social recovery', () => {
  beforeAll(async () => {
    // create identity
    await createBrightID();
  });

  describe('notification', () => {
    beforeAll(async () => {
      // create required number of connections to trigger notification
      await createFakeConnection();
      await createFakeConnection();
      await createFakeConnection();
      await createFakeConnection();
      await createFakeConnection();
      await createFakeConnection();
    });

    it('should show notification', async () => {
      // navigate from home screen to notifications
      await expectHomescreen();
      await element(by.id('notificationsBtn')).tap();
      await expectNotificationsScreen();
      // notification about social recovery should be visible
      await expect(element(by.id('SocialRecoveryNotifcation'))).toBeVisible();
    });

    it('should navigate to TrustedConnections screen', async () => {
      // click on notification
      await element(by.id('SocialRecoveryNotifcation')).tap();
      await expect(element(by.id('TrustedConnectionsScreen'))).toBeVisible();
    });
  });
});
