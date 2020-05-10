/* global device:false, element:false, by:false */

import { createBrightID, expectHomescreen } from './testUtils';

describe('Homescreen', () => {
  let mainUser = '';
  let hasBackButton = true;

  beforeAll(async () => {
    const platform = await device.getPlatform();
    hasBackButton = platform === 'android';
    // Reinstall app before starting tests to make sure all localStorage is cleared
    // await device.launchApp({ delete: true });
    // create identity and proceed to main screen
    mainUser = await createBrightID();
  });

  it('should show home screen with all elements', async () => {
    await expectHomescreen();
    await expect(element(by.id('PhotoContainer'))).toBeVisible();
    await expect(element(by.id('ScoreContainer'))).toBeVisible();
    await expect(element(by.id('ConnectionsCount'))).toBeVisible();
    await expect(element(by.id('GroupsCount'))).toBeVisible();
    await expect(element(by.id('VerificationsContainer'))).toBeVisible();
    await expect(element(by.id('ConnectButton'))).toBeVisible();
  });

  describe('Chat ActionSheet', () => {
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

  describe('Edit Profile', () => {
    // excluded due to https://github.com/BrightID/BrightID/issues/408
    xit('should cancel editing profile name with back button', async () => {
      if (!hasBackButton) return;
      const newName = 'Winston Wolfe';
      await expect(element(by.id('EditNameBtn'))).toHaveText(mainUser);
      await element(by.id('EditNameBtn')).tap();
      await element(by.id('EditNameInput')).clearText();
      await element(by.id('EditNameInput')).typeText(newName);
      await device.pressBack();
      await expect(element(by.id('EditNameBtn'))).toHaveText(mainUser);
    });

    it('should edit profile name', async () => {
      const newName = 'Butch Coolidge';
      await expect(element(by.id('EditNameBtn'))).toHaveText(mainUser);
      await element(by.id('EditNameBtn')).tap();
      await element(by.id('EditNameInput')).clearText();
      await element(by.id('EditNameInput')).typeText(newName);
      await element(by.id('EditNameInput')).tapReturnKey();
      await expect(element(by.id('EditNameBtn'))).toHaveText(newName);
    });

    it('should update profile picture from camera', async () => {
      await element(by.id('editPhoto')).tap();
      // ActionSheet does not support testID prop, so match based on text.
      await expect(element(by.text('Select photo'))).toBeVisible();
      // Following call is mocked through @utils/images.e2e.js to skip OS image picker
      await element(by.text('Take Photo')).tap();
      // TODO: Currently there is no way to check if the photo really changed, so this
      // testcase is not very useful.
    });

    it('should update profile picture from library', async () => {
      await element(by.id('editPhoto')).tap();
      // ActionSheet does not support testID prop, so match based on text.
      await expect(element(by.text('Select photo'))).toBeVisible();
      // Following call is mocked through @utils/images.e2e.js to skip OS image picker
      await element(by.text('Choose From Library')).tap();
      // TODO: Currently there is no way to check if the photo really changed, so this
      // testcase is not very useful.
    });
  });

  describe('New Connection screen', () => {
    it('should open "New Connection" screen by default', async () => {
      await element(by.id('ConnectButton')).tap();
      await expect(element(by.id('qrCode'))).toBeVisible();
      hasBackButton
        ? await device.pressBack()
        : await element(by.id('header-back')).tap();
      await expect(element(by.id('qrCode'))).toBeNotVisible();
    });

    it('should open "Scan Code" screen when tapping button', async () => {
      await element(by.id('ConnectButton')).tap();
      await element(by.id('scanCodeBtn')).tap();
      await expect(element(by.id('scanCode'))).toBeVisible();
      hasBackButton
        ? await device.pressBack()
        : await element(by.id('header-back')).tap();
      await expect(element(by.id('scanCode'))).toBeNotVisible();
    });

    it('should copy to clipboard', async () => {
      await element(by.id('ConnectButton')).tap();
      await expect(element(by.id('copyQrButton'))).toBeVisible();
      await element(by.id('copyQrButton')).tap();
      // TODO: Verify clipboard content is correct. Currently detox has no way to
      //  check clipboard contents, see e.g. https://github.com/wix/detox/issues/222
      hasBackButton
        ? await device.pressBack()
        : await element(by.id('header-back')).tap();
      await expect(element(by.id('copyQrButton'))).toBeNotVisible();
    });
  });
});
