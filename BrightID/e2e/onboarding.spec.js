/* global device:false, element:false, by:false */

describe('Example', () => {
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
  /*
  it('should show hello screen after tap', async () => {
    await element(by.id('hello_button')).tap();
    await expect(element(by.text('Hello!!!'))).toBeVisible();
  });

  it('should show world screen after tap', async () => {
    await element(by.id('world_button')).tap();
    await expect(element(by.text('World!!!'))).toBeVisible();
  });

 */
});
