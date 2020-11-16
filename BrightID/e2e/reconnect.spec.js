/* global device:false, element:false, by:false, waitFor:false */
import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  navigateHome,
  reconnect,
} from './testUtils';
import { report_reasons } from '../src/utils/constants';

describe('Reconnect existing connection', () => {
  beforeAll(async () => {
    // create identity
    await createBrightID();
  });

  describe('Changed profile', () => {
    beforeAll(async () => {
      // create a fake connection
      await createFakeConnection();
    });

    afterEach(async () => {
      await navigateHome();
    });

    beforeEach(async () => {
      await reconnect(0, true);
      // Reconnect screen should have old + new profile and abuse + Update buttons
      await expect(element(by.id('oldProfileView'))).toExist();
      await expect(element(by.id('newProfileView'))).toExist();
      await expect(element(by.id('reportAbuseBtn'))).toExist();
      await expect(element(by.id('updateBtn'))).toExist();
    });

    it('should update connection', async () => {
      await element(by.id('updateBtn')).tap();
      // should move to connections screen
      await expectConnectionsScreen();
    });

    it('should report abuse on connection', async () => {
      await element(by.id('reportAbuseBtn')).tap();
      // should open ReportReason modal
      await expect(element(by.id('ReportReasonModal'))).toBeVisible();
      // report as "fake"
      const reasonButton = element(by.id(`${report_reasons.FAKE}-RadioBtn`));
      await reasonButton.tap();
      // click Submit button
      const submitButton = element(by.id('SubmitReportBtn'));
      await submitButton.tap();
      // should be at MyCodeScreen
      await expect(element(by.id('MyCodeScreen'))).toBeVisible();
      // go to connections screen
      await navigateHome();
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
      // there should be no connection entry
      await expect(element(by.id('EmptyListView'))).toExist();
    });
  });

  describe('Identical profile', () => {
    beforeAll(async () => {
      // create a fake connection
      await createFakeConnection();
      await reconnect(0, false);
    });

    afterEach(async () => {
      await navigateHome();
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
