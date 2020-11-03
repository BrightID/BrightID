/* global device:false, element:false, by:false, waitFor:false */

import {
  createBrightID,
  expectAppsScreen,
  expectHomescreen,
  navigateHome,
} from './testUtils';

function getRandomAddres() {
  var letters = '0123456789ABCDEF';
  var a = '0x';
  for (var i = 0; i < 40; i++) {
    a += letters[Math.floor(Math.random() * 16)];
  }
  return a;
}

const apps = [
  {
    name: 'Gitcoin',
    context: 'Gitcoin',
  },
  {
    name: 'idchain',
    context: 'idchain',
  },
  {
    name: 'Ethereum',
    context: 'ethereum',
  },
  {
    name: 'DollarForEveryone',
    context: 'DollarForEveryone',
  },
  {
    name: 'clr.fund',
    context: 'clr.fund',
  },
];

describe('Linking without account', () => {
  it('should ignore deep link when running in background', async () => {
    // sends app to background and simulate being pulled to foreground again by clicking on deeplink
    await device.sendToHome();
    await device.launchApp({
      newInstance: false,
      url: `brightid://link-verification/http:%2f%2ftest.brightid.org/ethereum/${getRandomAddres()}`,
    });
    // app should show onboarding carousel screen
    await waitFor(element(by.id('brightIdOnboard'))).toBeVisible();
  });
  it('should ignore deep link when not running', async () => {
    await device.launchApp({
      newInstance: true,
      url: `brightid://link-verification/http:%2f%2ftest.brightid.org/ethereum/${getRandomAddres()}`,
    });
    // app should show onboarding carousel screen
    await waitFor(element(by.id('brightIdOnboard'))).toBeVisible();
  });
});

describe('Linking with account', () => {
  let yes, no;

  beforeAll(async () => {
    const platform = await device.getPlatform();
    const android = platform === 'android';
    no = android ? 'NO' : 'No';
    yes = android ? 'YES' : 'Yes';
    await createBrightID();
  });

  it('should start linking process when running in background', async () => {
    await device.sendToHome();
    await device.launchApp({
      newInstance: false,
      url: `brightid://link-verification/http:%2f%2ftest.brightid.org/${
        apps[0].context
      }/${getRandomAddres()}`,
    });
    // Alert should be open
    await expect(element(by.text('Link App?'))).toBeVisible();
    // cancel linking
    await element(by.text(no)).tap();
    await expectAppsScreen();
  });

  it('should start linking process when not running', async () => {
    await device.launchApp({
      newInstance: true,
      url: `brightid://link-verification/http:%2f%2ftest.brightid.org/${
        apps[0].context
      }/${getRandomAddres()}`,
    });
    // Alert should be open
    await expect(element(by.text('Link App?'))).toBeVisible();
    // cancel linking
    await element(by.text(no)).tap();
    await expectAppsScreen();
  });

  apps.forEach((app) => {
    describe(`App ${app.name}`, () => {
      beforeAll(async () => {
        await navigateHome();
        await expectHomescreen();
        await element(by.id('appsBtn')).tap();
        await expectAppsScreen();
      });

      it('should be listed on apps screen', async () => {
        await expect(element(by.id(`app-${app.name}`))).toBeVisible();
      });

      it('should not be linked', async () => {
        await expect(element(by.id(`app-${app.name}`))).toBeVisible();
      });

      it(`should successfully link ${app.name}`, async () => {
        await device.sendToHome();
        await device.launchApp({
          newInstance: false,
          url: `brightid://link-verification/http:%2f%2ftest.brightid.org/${
            app.context
          }/${getRandomAddres()}`,
        });
        // Alert should be open
        await expect(element(by.text('Link App?'))).toBeVisible();
        await element(by.text(yes)).tap();
        await expectAppsScreen();
        // Success alert should pop up when operation confirms. Wait up to 30 seconds.
        await waitFor(element(by.text('Success')))
          .toBeVisible()
          .withTimeout(30000);
        // dismiss success alert
        await element(by.text('OK')).tap();
        // should show apps screen
        await expectAppsScreen();
        // app context should now be linked
        expect(element(by.id(`Linked_${app.context}`))).toBeVisible();
      });
    });
  });
});
