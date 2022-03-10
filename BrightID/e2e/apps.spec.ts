import {
  createBrightID,
  createFakeConnection,
  expectAppsScreen,
  expectHomescreen,
  navigateHome,
} from './testUtils';
import { by, element, expect } from 'detox';


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
    id: '1hive',
    name: '1Hive',
    context: '1hive',
  },
  {
    id: 'Gitcoin',
    name: 'Gitcoin',
    context: 'Gitcoin',
  },
  {
    id: 'idchain',
    name: 'IDChain Eidi Faucet',
    context: 'idchain',
  },
  {
    id: 'RabbitHole',
    name: 'RabbitHole',
    context: 'RabbitHole',
  },
  {
    id: 'ethereum',
    name: 'Burn Signal',
    context: 'ethereum',
  },
  {
    id: 'clr.fund',
    name: 'clr.fund',
    context: 'clr.fund',
  },
  {
    id: 'top-up-gifter',
    name: 'Top-up Gifter',
    context: 'top-up-gifter',
  },
  {
    id: 'TheEther',
    name: 'The Ether',
    context: 'TheEther',
  },
  {
    id: 'Discord',
    name: 'Discord Unique Bot',
    context: 'Discord',
  },
];

describe('Without account', () => {
  it('should ignore deep link when running in background', async () => {
    // sends app to background and simulate being pulled to foreground again by clicking on deeplink
    await device.sendToHome();
    await device.launchApp({
      newInstance: false,
      url: `brightid://link-verification/http:%2f%2ftest.brightid.org/ethereum/${getRandomAddres()}`,
    });
    // app should show onboarding carousel screen
    await waitFor(element(by.id('OnboardScreen'))).toBeVisible();
  });
  it('should ignore deep link when not running', async () => {
    await device.launchApp({
      newInstance: true,
      url: `brightid://link-verification/http:%2f%2ftest.brightid.org/ethereum/${getRandomAddres()}`,
    });
    // app should show onboarding carousel screen
    await waitFor(element(by.id('OnboardScreen'))).toBeVisible();
  });
});

describe('With account', () => {
  let yes, no;

  beforeAll(async () => {
    const platform = await device.getPlatform();
    const android = platform === 'android';
    no = android ? 'NO' : 'No';
    yes = android ? 'YES' : 'Yes';
    await createBrightID();
    await createFakeConnection();
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

  describe('Apps screen', () => {
    beforeAll(async () => {
      await navigateHome();
      await expectHomescreen();
      await element(by.id('appsBtn')).tap();
      await expectAppsScreen();
    });

    for (const app of apps) {
      describe(`App ${app.name}`, () => {
        it('should be listed on apps screen', async () => {
          await waitFor(element(by.id(`app-${app.id}`)))
            .toBeVisible()
            .whileElement(by.id('appsList'))
            .scroll(100, 'down');
          await expect(element(by.text(app.name))).toExist();
        });

        it('should not be linked', async () => {
          await expect(element(by.id(`Linked_${app.id}`))).toNotExist();
        });
      });
    }
  });

  describe('Link', () => {
    beforeAll(async () => {
      await navigateHome();
      await expectHomescreen();
      await element(by.id('appsBtn')).tap();
      await expectAppsScreen();
      await element(by.id('appsList')).scrollTo('top');
    });

    for (const app of apps) {
      describe(`App ${app.name}`, () => {
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
          // app context should now be linked
          await waitFor(element(by.id(`Linked_${app.id}`)))
            .toBeVisible()
            .whileElement(by.id('appsList'))
            .scroll(50, 'down');
          // await expect(element(by.id(`Linked_${app.id}`))).toBeVisible();
        });
      });
    }
  });
});
