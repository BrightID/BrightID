/* global device:false, element:false, by:false */

import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  expectHomescreen,
} from './testUtils';

describe('Connections', () => {
  let hasBackButton = true;
  beforeAll(async () => {
    const platform = await device.getPlatform();
    hasBackButton = platform === 'android';
    // create identity
    await createBrightID();
  });

  describe('Adding connection', () => {
    it('should reject new connection with "reject" button', async () => {
      await element(by.id('connectionsBtn')).tap();
      await createFakeConnection();
      await element(by.id('rejectConnectionBtn')).tap();
      await expectHomescreen();
    });

    it('should reject new connection with back button', async () => {
      if (!hasBackButton) return;

      await element(by.id('connectionsBtn')).tap();
      await createFakeConnection();
      await device.pressBack();
      await expectHomescreen();
    });

    it('should accept new connection', async () => {
      await element(by.id('connectionsBtn')).tap();
      await createFakeConnection();
      await element(by.id('confirmConnectionBtn')).tap();
      await expect(element(by.id('successScreen'))).toBeVisible();
      await element(by.id('successDoneBtn')).tap();
      await expectConnectionsScreen();
    });
  });
});
