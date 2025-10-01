import { by, element, expect } from 'detox';
import { connection_levels } from '@/utils/constants';
import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  expectHomescreen,
  expectNotificationsScreen,
  navigateHome,
  operationTimeout,
} from './testUtils';

describe('social recovery', () => {
  beforeAll(async () => {
    await device.launchApp();
    // create identity
    await createBrightID();
  });

  describe('notification', () => {
    beforeAll(async () => {
      // create required number of connections to trigger notification
      await createFakeConnection(true, connection_levels.ALREADY_KNOWN);
      await createFakeConnection(true, connection_levels.ALREADY_KNOWN);
      await createFakeConnection(true, connection_levels.ALREADY_KNOWN);

      // make sure all connections are established
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
      await waitFor(element(by.id('connection-0')))
        .toExist()
        .withTimeout(operationTimeout);
      await waitFor(element(by.id('connection-1')))
        .toExist()
        .withTimeout(operationTimeout);
      await waitFor(element(by.id('connection-2')))
        .toExist()
        .withTimeout(operationTimeout);
      await navigateHome();
    });

    it('should show notification', async () => {
      // navigate from home screen to notifications
      await expectHomescreen();
      await element(by.id('notificationsBtn')).tap();
      await expectNotificationsScreen();
      // notification about social recovery should be visible
      await expect(element(by.id('SocialRecoveryNotifcation'))).toBeVisible();
    });

    it('should navigate to Recovery Connections screen', async () => {
      // click on notification
      await element(by.id('SocialRecoveryNotifcation')).tap();
      await expect(element(by.id('RecoveryConnectionsScreen'))).toBeVisible();
    });
  });
});
