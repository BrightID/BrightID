/* global element:false, by:false */

describe('Onboarding', () => {
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
});
