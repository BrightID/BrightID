/* global device:false, element:false, by:false, waitFor:false */

describe('Example', () => {
  beforeAll(async () => {
    // Reinstall app before starting tests to make sure all localStorage is cleared
    await device.launchApp({ delete: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have onboarding carousel screen', async () => {
    // First page should be there at start
    await expect(element(by.id('brightIdOnboard'))).toBeVisible();
    // Swipe left to show second page
    await element(by.id('Carousel')).swipe('left');
    // Now second page should be visible
    await expect(element(by.id('MaintainPrivacy'))).toBeVisible();
    // Swipe right to show first page again
    await element(by.id('Carousel')).swipe('right');
    // First page should be visible again
    await expect(element(by.id('brightIdOnboard'))).toBeVisible();
  });

  it('should create a new identity', async () => {
    await element(by.id('getStartedBtn')).tap();
    await element(by.id('editName')).tap();
    await element(by.id('editName')).typeText('Player Unknown');
    await element(by.id('editName')).tapReturnKey();
    await element(by.id('addPhoto')).tap();
    // ActionSheet does not support testID prop, so match based on text.
    await expect(element(by.text('Select photo'))).toBeVisible();
    // Following call is mocked through @utils/images.e2e.js to skip OS image picker
    await element(by.text('Choose From Library')).tap();
    // Wait until photo is loaded
    await waitFor(element(by.id('editPhoto')))
      .toBeVisible()
      .withTimeout(2000);
    // create new ID
    await element(by.id('createBrightIDBtn')).tap();
    // should end up at home screen
    await waitFor(element(by.id('homeScreen')))
      .toBeVisible()
      .withTimeout(2000);
  });
});
