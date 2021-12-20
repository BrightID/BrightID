/* global device:false, element:false, by:false */

import { createBrightID, expectHomescreen } from './testUtils';

describe('Homescreen', () => {
  let mainUser = '';
  let hasBackButton = true;

  beforeAll(async () => {
    const platform = await device.getPlatform();
    hasBackButton = platform === 'android';
    // create identity and proceed to main screen
    mainUser = await createBrightID();
  });

  it('should show home screen with all elements', async () => {
    await expectHomescreen();
    await expect(element(by.id('PhotoContainer'))).toBeVisible();
    await expect(element(by.id('ConnectionsCount'))).toBeVisible();
    await expect(element(by.id('AppsCount'))).toBeVisible();
    await expect(element(by.id('AchievementsCount'))).toBeVisible();
    await expect(element(by.id('MyCodeBtn'))).toBeVisible();
    await expect(element(by.id('ScanCodeBtn'))).toBeVisible();
    await expect(element(by.id('JoinCommunityBtn'))).toBeVisible();
  });

  // Test disabled for now as JoinCommunityBtn has special meaning in DEV mode
  xdescribe('Chat ActionSheet', () => {
    /*
      open chat action sheet, check all options are there and close again
    */
    it('should show chat ActionSheet and close with cancel button', async () => {
      // ActionSheet does not support testID, so try to match based on text.
      await expect(element(by.text('Like to chat with us?'))).toBeNotVisible();
      await element(by.id('chatButton')).tap();
      await expect(element(by.text('Like to chat with us?'))).toBeVisible();
      await expect(element(by.text('BrightID Discord'))).toBeVisible();
      await element(by.text('cancel')).tap();
      await expect(element(by.text('Like to chat with us?'))).toBeNotVisible();
    });

    it('should show chat ActionSheet and close with back button', async () => {
      if (!hasBackButton) return;
      // ActionSheet does not support testID, so try to match based on text.
      await expect(element(by.text('Like to chat with us?'))).toBeNotVisible();
      await element(by.id('chatButton')).tap();
      await expect(element(by.text('Like to chat with us?'))).toBeVisible();
      await expect(element(by.text('BrightID Discord'))).toBeVisible();
      await device.pressBack();
      await expect(element(by.text('Like to chat with us?'))).toBeNotVisible();
    });
  });

  // TODO: Edit profile functionality moved to own screen (https://github.com/BrightID/BrightID/issues/633)
  describe('Edit Profile', () => {
    // excluded due to https://github.com/BrightID/BrightID/issues/408
    test.skip('should cancel editing profile name with back button', async () => {
      if (!hasBackButton) return;
      const newName = 'Winston Wolfe';
      await expect(element(by.id('EditNameBtn'))).toHaveText(mainUser);
      await element(by.id('EditNameBtn')).tap();
      await element(by.id('EditNameInput')).clearText();
      await element(by.id('EditNameInput')).typeText(newName);
      await device.pressBack();
      await expect(element(by.id('EditNameBtn'))).toHaveText(mainUser);
    });

    test.skip('should edit profile name', async () => {
      const newName = 'Butch Coolidge';
      await expect(element(by.id('EditNameBtn'))).toHaveText(mainUser);
      await element(by.id('EditNameBtn')).tap();
      await element(by.id('EditNameInput')).replaceText(newName);
      await element(by.id('EditNameInput')).tapReturnKey();
      await expect(element(by.id('EditNameBtn'))).toHaveText(newName);
    });

    test.skip('should update profile picture from camera', async () => {
      await element(by.id('editPhoto')).tap();
      // ActionSheet does not support testID prop, so match based on text.
      await expect(element(by.text('Select photo'))).toBeVisible();
      // Following call is mocked through @utils/images.e2e.js to skip OS image picker
      await element(by.text('Take Photo')).tap();
      // TODO: Currently there is no way to check if the photo really changed, so this
      // testcase is not very useful.
    });

    test.skip('should update profile picture from library', async () => {
      await element(by.id('editPhoto')).tap();
      // ActionSheet does not support testID prop, so match based on text.
      await expect(element(by.text('Select photo'))).toBeVisible();
      // Following call is mocked through @utils/images.e2e.js to skip OS image picker
      await element(by.text('Choose From Library')).tap();
      // TODO: Currently there is no way to check if the photo really changed, so this
      // testcase is not very useful.
    });
  });
});
