/* global device:false, element:false, by:false, waitFor:false */
import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  navigateHome,
} from './testUtils';

describe('Reconnect existing connection', () => {
  const flagActionSheetTitle = 'What do you want to do?';
  const action = 'Reconnect';

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
      // Note: In order to have an open channel visit MyCodeScreen before attempting reconnect

      // open MyCode screen
      await element(by.id('MyCodeBtn')).tap();
      // make sure SINGLE connection mode is active
      await expect(element(by.id('single-use-code'))).toExist();
      // go to connections screen
      await navigateHome();
      await element(by.id('connectionsBtn')).tap();

      // should be on connectionsscreen
      await expectConnectionsScreen();

      // wait upto 30 seconds till connection is established
      await waitFor(element(by.text('Connected a few seconds ago')))
        .toBeVisible()
        .withTimeout(30000);

      // swipe to reach flagBtn
      await element(by.id('connectionCardText')).swipe('left');
      await waitFor(element(by.id('flagBtn')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('flagBtn')).tap();

      // ActionSheet does not support testID, so match based on text.
      await waitFor(element(by.text(flagActionSheetTitle)))
        .toBeVisible()
        .withTimeout(10000);

      // trigger reconnect
      await element(by.text(action)).tap();

      // navigate to MyCodeScreen, there it will pick up the incoming connection profile
      await navigateHome();
      await element(by.id('MyCodeBtn')).tap();
      await expect(element(by.id('ReconnectScreen'))).toBeVisible();

      // Reconnect screen should have old + new profile and abuse + Update buttons
      await expect(element(by.id('oldProfileView'))).toExist();
      await expect(element(by.id('newProfileView'))).toExist();
      await expect(element(by.id('reportAbuseBtn'))).toExist();
      await expect(element(by.id('updateBtn'))).toExist();
    });

    it('should update connection', async () => {
      await expect(element(by.id('updateBtn'))).toExist();
      await element(by.id('updateBtn')).tap();
      // should move to connections screen
      await expectConnectionsScreen();
    });

    it('should report abuse on connection', async () => {
      await expect(element(by.id('reportAbuseBtn'))).toExist();
      await element(by.id('reportAbuseBtn')).tap();

      // should move to connections screen
      await expectConnectionsScreen();
      // there should be no connection entry
      await expect(element(by.id('EmptyListView'))).toExist();
    });
  });

  describe('Identical profile', () => {
    test.todo('should accept connection');
  });
});
