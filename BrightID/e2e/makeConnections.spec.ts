import { by, element, expect } from 'detox';
import i18next from 'i18next';
import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  expectHomescreen,
  navigateHome,
} from './testUtils';
import { connection_levels, report_reasons } from '@/utils/constants';

describe('make Connections', () => {
  beforeAll(async () => {
    await device.launchApp();
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
      const copyBtn = element(by.text(i18next.t('common.button.copy')));
      await expect(copyBtn).toBeVisible();
      await copyBtn.tap();
      // TODO: Verify clipboard content is correct. Currently detox has no way to
      //  check clipboard contents, see e.g. https://github.com/wix/detox/issues/222
      await expect(copyBtn).not.toBeVisible();
    });

    it('should toggle connection type', async () => {
      await expect(element(by.id('ConnectionInfoSingleBtn'))).toExist();
      await element(by.id('ChannelSwitch')).tap();
      await expect(element(by.id('ConnectionInfoGroupBtn'))).toExist();
      await element(by.id('ChannelSwitch')).tap();
      await expect(element(by.id('ConnectionInfoSingleBtn'))).toExist();
    });
  });

  describe('Connect with positive Connection levels', () => {
    const levels: Array<ConnectionLevel> = [
      connection_levels.JUST_MET,
      connection_levels.ALREADY_KNOWN,
    ];

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

  describe('Connect with suspicious Connection levels', () => {
    afterEach(async () => {
      await navigateHome();
    });

    it(`should create a suspicious connection and report it`, async () => {
      const level = connection_levels.SUSPICIOUS;
      const reason = report_reasons.SPAMMER;
      const testID = `${level}Btn`;
      await createFakeConnection(false);
      // confirm connection with SUSPICIOUS level
      await expect(element(by.id(testID))).toBeVisible();
      await element(by.id(testID)).tap();
      // should now show report reason modal
      await expect(element(by.id('ReportReasonModal'))).toBeVisible();
      const reasonButton = element(by.id(`${reason}-RadioBtn`));
      const submitButton = element(by.id('SubmitReportBtn'));
      await expect(reasonButton).toBeVisible();
      await reasonButton.tap();
      // click Submit button
      await submitButton.tap();
      // modal should be closed
      await expect(element(by.id('ReportReasonModal'))).not.toBeVisible();

      // Should end up in the connection list
      await expectConnectionsScreen();
    });
  });
});
