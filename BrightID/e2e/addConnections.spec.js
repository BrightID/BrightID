/* global device:false, element:false, by:false */

import {
  createBrightID,
  createFakeConnection,
  expectHomescreen,
} from './testUtils';

describe('Connections', () => {
  let hasBackButton = true;

  beforeAll(async () => {
    const platform = await device.getPlatform();
    hasBackButton = platform === 'android';
    // Reinstall app before starting tests to make sure all localStorage is cleared
    await device.launchApp({ delete: true });
    // create identity
    await createBrightID();
  });

  describe('Adding connection', () => {
    it('should reject new connection with "reject" button', async () => {
      await element(by.id('tabBarConnectionsBtn')).tap();
      await createFakeConnection();
      await element(by.id('rejectConnectionBtn')).tap();
      await expectHomescreen();
    });
    if (hasBackButton) {
      it('should reject new connection with back button', async () => {
        await element(by.id('tabBarConnectionsBtn')).tap();
        await createFakeConnection();
        await device.pressBack();
        await expectHomescreen();
      });
    }
    it('should accept new connection', async () => {
      await element(by.id('tabBarConnectionsBtn')).tap();
      await createFakeConnection();
      await element(by.id('confirmConnectionBtn')).tap();
      await expect(element(by.id('successScreen'))).toBeVisible();
      await element(by.id('successDoneBtn')).tap();
      await expectHomescreen();
      await expect(element(by.id('ConnectionsCount'))).toHaveText('1');
    });
  });
});
