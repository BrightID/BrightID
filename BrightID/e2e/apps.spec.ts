import { by, element, expect } from 'detox';
import {
  createBrightID,
  createFakeConnection,
  expectAppsScreen,
  expectHomescreen,
  navigateHome,
  operationTimeout,
} from './testUtils';
import { app_linking_steps, SPONSOR_WAIT_TIME } from '@/utils/constants';

function getRandomAddres() {
  const letters = '0123456789ABCDEF';
  let a = '0x';
  for (let i = 0; i < 40; i++) {
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
    await expect(element(by.id('AppLinkingConfirmationView'))).toBeVisible();
    // cancel linking
    await element(by.id('RejectLinking')).tap();
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
    await expect(element(by.id('AppLinkingConfirmationView'))).toBeVisible();
    // cancel linking
    await element(by.id('RejectLinking')).tap();
    await expectAppsScreen();
  });

  it('should fail sponsoring when user is not sponsored', async () => {
    const context = 'idchain';
    await device.launchApp({
      newInstance: true,
      url: `brightid://link-verification/http:%2f%2ftest.brightid.org/${context}/${getRandomAddres()}`,
    });
    // Alert should be open
    await expect(element(by.id('AppLinkingConfirmationView'))).toBeVisible();
    // confirm linking
    await element(by.id('ConfirmLinking')).tap();

    // next step: SPONSORE_PRECHECK_APP
    // skip this step as it is very short and missed by test

    // next step: SPONSOR_WAITING_OP
    await expect(
      element(by.id(`AppLinkingStep-${app_linking_steps.SPONSOR_WAITING_OP}`)),
    ).toBeVisible();

    // next step: SPONSOR_WAITING_APP
    // This will happen once the sponsor op confirms, so we need an according timeout
    await waitFor(
      element(by.id(`AppLinkingStep-${app_linking_steps.SPONSOR_WAITING_APP}`)),
    )
      .toBeVisible()
      .withTimeout(operationTimeout);

    // App will not sponsor, so we should end up with error state
    // This will happen once the app gives up waiting for sponsoring, so we need
    // an according timeout
    await waitFor(
      element(
        by.id(`AppLinkingError-${app_linking_steps.SPONSOR_WAITING_APP}`),
      ),
    )
      .toBeVisible()
      .withTimeout(SPONSOR_WAIT_TIME + 1000);
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
          await expect(element(by.id(`Linked_${app.id}`))).not.toExist();
        });
      });
    }
  });

  /*
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
          // Success alert should pop up when operation confirms.
          await waitFor(element(by.text('Success')))
            .toBeVisible()
            .withTimeout(operationTimeout);
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
  }); */
});
