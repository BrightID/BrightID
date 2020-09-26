/* global device:false, element:false, by:false, waitFor:false */

import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  navigateHome,
} from './testUtils';

describe('Connections', () => {
  let hasBackButton = true;
  const flagActionSheetTitle = 'What do you want to do?';
  const actions = ['Flag as Duplicate', 'Flag as Fake', 'Flag as Deceased'];

  beforeAll(async () => {
    const platform = await device.getPlatform();
    hasBackButton = platform === 'android';
    // create identity
    await createBrightID();
  });

  actions.forEach((action) => {
    describe(action, () => {
      // create new fake connection and navigate to Connections screen
      beforeAll(async () => {
        await createFakeConnection();
        // go to connections screen
        await element(by.id('connectionsBtn')).tap();
        await expectConnectionsScreen();
      });

      beforeEach(async () => {
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
      });

      afterAll(async () => {
        await navigateHome();
      });

      it(`should cancel ${action} with backButton (Android)`, async () => {
        if (!hasBackButton) return;
        await element(by.text(action)).tap();
        await device.pressBack();
        await expect(element(by.text(flagActionSheetTitle))).toBeNotVisible();
      });

      it(`should cancel ${action} with Cancel button `, async () => {
        const cancelText = hasBackButton ? 'CANCEL' : 'Cancel';
        await element(by.text(action)).tap();
        await element(by.text(cancelText)).tap();
        await expect(element(by.text(flagActionSheetTitle))).toBeNotVisible();
      });

      it(`should confirm ${action}`, async () => {
        await element(by.text(action)).tap();
        await element(by.text('OK')).tap();
        await waitFor(element(by.id('flagConnectionBtn')))
          .toNotExist()
          .withTimeout(20000);
      });
    });
  });
});
