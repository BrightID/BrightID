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

      afterAll(async () => {
        await navigateHome();
      });

      it(`should cancel ${action} (backButton)`, async () => {
        // device is not defined outside of it
        if (!hasBackButton) return;
        // flag the first available connection
        await waitFor(element(by.id('flagConnectionBtn')).atIndex(0))
          .toExist()
          .withTimeout(20000);
        await element(by.id('flagConnectionBtn')).atIndex(0).tap();
        // ActionSheet does not support testID, so try to match based on text.
        await expect(element(by.text(flagActionSheetTitle))).toBeVisible();
        await element(by.text(action)).tap();
        await device.pressBack();

        await expect(element(by.text(flagActionSheetTitle))).toBeNotVisible();
      });

      it(`should cancel ${action}`, async () => {
        const cancelText = hasBackButton ? 'CANCEL' : 'Cancel';
        // flag the first available connection
        await waitFor(element(by.id('flagConnectionBtn')).atIndex(0))
          .toExist()
          .withTimeout(20000);
        await element(by.id('flagConnectionBtn')).atIndex(0).tap();
        // ActionSheet does not support testID, so try to match based on text.
        await expect(element(by.text(flagActionSheetTitle))).toBeVisible();
        await element(by.text(action)).tap();
        await element(by.text(cancelText)).tap();
        await expect(element(by.text(flagActionSheetTitle))).toBeNotVisible();
      });

      it(`should confirm ${action}`, async () => {
        // flag the first available connection
        await waitFor(element(by.id('flagConnectionBtn')).atIndex(0))
          .toExist()
          .withTimeout(20000);
        await element(by.id('flagConnectionBtn')).atIndex(0).tap();
        // ActionSheet does not support testID, so try to match based on text.
        await expect(element(by.text(flagActionSheetTitle))).toBeVisible();
        await element(by.text(action)).tap();
        await element(by.text('OK')).tap();
        await waitFor(element(by.id('flagConnectionBtn')).atIndex(0))
          .toNotExist()
          .withTimeout(20000);
      });
    });
  });
});
