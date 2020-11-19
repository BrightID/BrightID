/* global element:false, by:false */

import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  expectHomescreen,
  navigateHome,
} from './testUtils';

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
      await expect(element(by.text('COPY TO CLIPBOARD'))).toBeVisible();
      await element(by.text('COPY TO CLIPBOARD')).tap();
      // TODO: Verify clipboard content is correct. Currently detox has no way to
      //  check clipboard contents, see e.g. https://github.com/wix/detox/issues/222
      await expect(element(by.text('COPY TO CLIPBOARD'))).not.toBeVisible();
    });

    it('should toggle connection type', async () => {
      await expect(element(by.id('ConnectionInfoSingleBtn'))).toExist();
      await element(by.id('ChannelSwitch')).tap();
      await expect(element(by.id('ConnectionInfoGroupBtn'))).toExist();
      await element(by.id('ChannelSwitch')).tap();
      await expect(element(by.id('ConnectionInfoSingleBtn'))).toExist();
    });
  });

  describe('Connect with different Connection levels', () => {
    const levels = ['suspicious', 'just met', 'already known'];

    afterEach(async () => {
      await navigateHome();
    });

    levels.forEach((level) => {
      it(`should create a connection with level "${level}"`, async () => {
        const testID = `${level}Btn`;
        await createFakeConnection(false);
        // confirm connection with specified level and navigate back to home screen
        await expect(element(by.id(testID))).toBeVisible();
        await element(by.id(testID)).tap();
        // Should end up in the connection list
        await expectConnectionsScreen();
      });
    });
  });
});
