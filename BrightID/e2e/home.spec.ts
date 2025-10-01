import { by, element, expect } from 'detox';
import { createBrightID } from './testUtils';

describe('Homescreen', () => {
  // const mainUser = testUserName;
  // let hasBackButton = true;

  beforeAll(async () => {
    // const platform = await device.getPlatform();
    // hasBackButton = platform === 'android';
    await device.launchApp();
    // create identity and proceed to main screen
    await createBrightID();
  });

  it('should show home screen with all elements', async () => {
    // await expectHomescreen();
    await expect(element(by.id('PhotoContainer'))).toBeVisible(50);
    await expect(element(by.id('ConnectionsCount'))).toBeVisible();
    await expect(element(by.id('AppsCount'))).toBeVisible();
    await expect(element(by.id('AchievementsCount'))).toBeVisible();
    await expect(element(by.id('MyCodeBtn'))).toBeVisible();
    await expect(element(by.id('ScanCodeBtn'))).toBeVisible();
    await expect(element(by.id('JoinCommunityBtn'))).toBeVisible();
  });
});
