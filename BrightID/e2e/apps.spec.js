/* global device:false, element:false, by:false */

import {
  createBrightID,
  expectAppsScreen,
  expectHomescreen,
} from './testUtils';

describe('App Deep Links', () => {
  let yes, no;

  describe('Open Deep Link without Account', () => {
    beforeAll(async () => {
      await device.sendToHome();
      await device.launchApp({
        newInstance: false,
        url:
          'brightid://link-verification/http:%2f%2fnode.brightid.org/ethereum/0xdC2681C2cef66649045E3eB2B2bb505D2D1564ba',
      });
    });
    it('should not open apps page', async () => {
      await expectAppsScreen(false);
    });
  });

  describe('Open Deep Link', () => {
    beforeAll(async () => {
      // create identity
      const platform = await device.getPlatform();
      const android = platform === 'android';
      no = android ? 'NO' : 'No';
      yes = android ? 'YES' : 'Yes';
      await device.reloadReactNative();
      await createBrightID();
    });
    beforeEach(async () => {
      await device.sendToHome();
      await device.launchApp({
        newInstance: false,
        url:
          'brightid://link-verification/http:%2f%2fnode.brightid.org/ethereum/0xdC2681C2cef66649045E3eB2B2bb505D2D1564ba',
      });
    });
    it('should not link app and return to home page', async () => {
      await element(by.text(no)).tap();
      await expectHomescreen();
    });
    it('should link app', async () => {
      await element(by.text(yes)).tap();
      await expectAppsScreen(true);
    });
  });
});
