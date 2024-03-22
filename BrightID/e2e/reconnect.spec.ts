import { by, element, expect } from 'detox';
import { getConnectionLevelString } from '@/utils/connectionLevelStrings';
import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  navigateHome,
  operationTimeout,
  reconnect,
} from './testUtils';
import { connection_levels, report_reasons } from '@/utils/constants';

describe('Reconnect existing connection', () => {
  beforeAll(async () => {
    // create identity
    await createBrightID();
  });

  describe('Changed profile', () => {
    beforeAll(async () => {
      // create a fake connection
      await createFakeConnection();
      // make sure all connections are established
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
      await waitFor(element(by.id('connection-0')))
        .toExist()
        .withTimeout(operationTimeout);
      await navigateHome();
    });

    beforeEach(async () => {
      await reconnect(0, true);
      // Reconnect screen should have old + new profile, connection level slider, and abuse + Update buttons
      await expect(element(by.id('oldProfileView'))).toExist();
      await expect(element(by.id('newProfileView'))).toExist();
      await expect(element(by.id('ConnectionLevelSlider'))).toExist();
      await expect(element(by.id('reportAbuseBtn'))).toExist();
      await expect(element(by.id('updateBtn'))).toExist();
    });

    afterEach(async () => {
      await navigateHome();
    });

    it('should reconnect with same connection level', async () => {
      await element(by.id('updateBtn')).tap();
      // should move to connections screen
      await expectConnectionsScreen();
      // wait till operation is applied
      await waitFor(element(by.id('connection-0')))
        .toBeVisible()
        .withTimeout(operationTimeout);
    });

    /*
      TODO - Fix this test. Currently the swipe does not work, instead detox seems to
      cause random taps on the existing profile image, triggering the large image popup.
    */
    xit('should reconnect with different connection level', async () => {
      // check initial value
      await expect(element(by.id('ConnectionLevelSliderText'))).toHaveText(
        getConnectionLevelString(connection_levels.JUST_MET),
      );
      // set new value by swiping right
      // "adjustSliderToPosition" is only available on iOS, so we have to use the not-so-exact "swipe" method
      // This will swipe all the way to the right, so the new expected level is RECOVERY
      await element(by.id('ReconnectSliderView')).swipe('right', 'fast');
      await expect(element(by.id('ConnectionLevelSliderText'))).toHaveText(
        getConnectionLevelString(connection_levels.RECOVERY),
      );
      await element(by.id('updateBtn')).tap();
      // should move to connections screen
      await expectConnectionsScreen();
      // wait till operation is applied
      await waitFor(element(by.id('connection-0')))
        .toBeVisible()
        .withTimeout(operationTimeout);
      // new connection level should be set
      await expect(element(by.id('connection_level-0'))).toHaveText(
        getConnectionLevelString(connection_levels.RECOVERY),
      );
    });

    it('should report abuse on connection', async () => {
      await element(by.id('reportAbuseBtn')).tap();
      // should open ReportReason modal
      await expect(element(by.id('ReportReasonModal'))).toBeVisible();
      // report as "spammer"
      const reasonButton = element(by.id(`${report_reasons.SPAMMER}-RadioBtn`));
      await reasonButton.tap();
      // click Submit button
      const submitButton = element(by.id('SubmitReportBtn'));
      await submitButton.tap();

      await expectConnectionsScreen();
      // there should be no connection entry
      await expect(element(by.id('EmptyListView'))).toExist();
    });
  });

  describe('Identical profile', () => {
    beforeAll(async () => {
      // create a fake connection
      await createFakeConnection();
      // make sure all connections are established
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
      await waitFor(element(by.id('connection-0')))
        .toExist()
        .withTimeout(operationTimeout);
      await navigateHome();
      await reconnect(0, false);
    });

    it('should recognize the profile is not changed', async () => {
      // Reconnect screen should have one profile view and the update buttons
      await expect(element(by.id('identicalProfileView'))).toExist();
      await expect(element(by.id('updateBtn'))).toExist();
      // abuse button should not exist
      await expect(element(by.id('reportAbuseBtn'))).not.toExist();
    });

    it('should update connection', async () => {
      await expect(element(by.id('updateBtn'))).toExist();
      await element(by.id('updateBtn')).tap();
      // should move to connections screen
      await expectConnectionsScreen();
    });
  });
});
