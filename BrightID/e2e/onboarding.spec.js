/* global device:false, element:false, by:false */

import { createBrightID } from './testUtils';

describe('Example', () => {
  beforeAll(async () => {
    // Reinstall app before starting tests to make sure all localStorage is cleared
    await device.launchApp({ delete: true });
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
    await createBrightID();
  });
});
