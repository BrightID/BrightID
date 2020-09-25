/* global element:false, by:false */

import { createBrightID, expectHomescreen } from './testUtils';

describe('make Connections', () => {
  beforeAll(async () => {
    // create identity and proceed to main screen
    await createBrightID();
  });

  describe('MyCode/ScanCode screen', () => {
    beforeAll(async () => {
      // open MyCode screen
      await element(by.id('MyCodeBtn')).tap();
    });

    afterAll(async () => {
      // back to home screen
      await element(by.id('NavHomeBtn')).tap();
      await expectHomescreen();
    });

    it('should display qrcode', async () => {
      await expect(element(by.id('ChannelSwitch'))).toBeVisible();
      await expect(element(by.id('ConnectionInfoSingleBtn'))).toBeVisible();
      await expect(element(by.id('TimerContainer'))).toBeVisible();
      await expect(element(by.id('QRCodeContainer'))).toBeVisible();
      await expect(element(by.id('CopyQrBtn'))).toBeVisible();
      await expect(element(by.id('MyCodeToScanCodeBtn'))).toBeVisible();
    });

    it('should navigate from MyCode screen to ScanCode screen', async () => {
      await element(by.id('MyCodeToScanCodeBtn')).tap();
      await expect(element(by.id('CameraContainer'))).toBeVisible();
    });

    it('should navigate from ScanCode screen back to MyCode screen', async () => {
      await element(by.id('ScanCodeToMyCodeBtn')).tap();
      await expect(element(by.id('QRCodeContainer'))).toBeVisible();
      await expect(element(by.id('CameraContainer'))).not.toExist();
    });

    it('should copy to clipboard', async () => {
      await element(by.id('CopyQrBtn')).tap();
      await element(by.text('COPY TO CLIPBOARD')).tap();
      // TODO: Verify clipboard content is correct. Currently detox has no way to
      //  check clipboard contents, see e.g. https://github.com/wix/detox/issues/222
    });

    it('should toggle connection type', async () => {
      // text should read "One to One" initially
      await expect(element(by.id('ConnectionInfoSingleBtn'))).toExist();
      await element(by.id('ChannelSwitch')).tap();
      await expect(element(by.id('ConnectionInfoGroupBtn'))).toExist();
      await element(by.id('ChannelSwitch')).tap();
      await expect(element(by.id('ConnectionInfoSingleBtn'))).toExist();
    });
  });
});
