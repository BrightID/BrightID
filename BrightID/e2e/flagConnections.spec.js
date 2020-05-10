/* global device:false, element:false, by:false, waitFor:false */

import { createBrightID, createFakeConnection } from './testUtils';

describe('Connections', () => {
  let hasBackButton = true;
  const flagActionSheetTitle = 'What do you want to do?';
  const actions = ['Flag as Duplicate', 'Flag as Fake', 'Flag as Deceased'];

  beforeAll(async () => {
    const platform = await device.getPlatform();
    hasBackButton = platform === 'android';
    // Reinstall app before starting tests to make sure all localStorage is cleared
    // await device.launchApp({ delete: true });
    // create identity
    await createBrightID();
    await element(by.id('tabBarConnectionsBtn')).tap();
  });

  actions.forEach((action) => {
    describe(action, () => {
      // create new fake connection and navigate to Connections screen
      beforeAll(async () => {
        await createFakeConnection();
        await element(by.id('confirmConnectionBtn')).tap();
        await expect(element(by.id('successScreen'))).toBeVisible();
        await element(by.id('successDoneBtn')).tap();
        await element(by.id('tabBarConnectionsBtn')).tap();
      });

      it(`should cancel ${action} (backButton)`, async () => {
        // device is not defined outside of it
        if (!hasBackButton) return;
        // flag the first available connection
        await waitFor(element(by.id('flagConnectionBtn')).atIndex(0))
          .toExist()
          .withTimeout(2000);
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
          .withTimeout(2000);
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
          .withTimeout(2000);
        await element(by.id('flagConnectionBtn')).atIndex(0).tap();
        // ActionSheet does not support testID, so try to match based on text.
        await expect(element(by.text(flagActionSheetTitle))).toBeVisible();
        await element(by.text(action)).tap();
        await element(by.text('OK')).tap();
        await waitFor(element(by.id('flagConnectionBtn')).atIndex(0))
          .toNotExist()
          .withTimeout(2000);
      });
    });
  });
});
