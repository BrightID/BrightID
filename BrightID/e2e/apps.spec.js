/* global device:false, element:false, by:false */

import fetch from 'node-fetch';
import {
  createBrightID,
  expectAppsScreen,
  expectHomescreen,
} from './testUtils';

function getRandomAddres() {
  var letters = '0123456789ABCDEF';
  var a = '0x';
  for (var i = 0; i < 40; i++) {
    a += letters[Math.floor(Math.random() * 16)];
  }
  return a;
}

describe('App Deep Links', () => {
  let yes, no;

  describe('Open Deep Link without Account', () => {
    beforeAll(async () => {
      await device.sendToHome();
      await device.launchApp({
        newInstance: false,
        url: `brightid://link-verification/http:%2f%2ftest.brightid.org/ethereum/${getRandomAddres()}`,
      });
    });
    it('should not open apps page', async () => {
      await expectAppsScreen(false);
    });
  });

  xdescribe('Open Deep Link', () => {
    beforeAll(async () => {
      // create identity
      const platform = await device.getPlatform();
      const android = platform === 'android';
      no = android ? 'NO' : 'No';
      yes = android ? 'YES' : 'Yes';
      await device.reloadReactNative();
      await createBrightID();
    });
    beforeEach(async () => {
      await device.sendToHome();
      await device.launchApp({
        newInstance: false,
        url: `brightid://link-verification/http:%2f%2ftest.brightid.org/ethereum/${getRandomAddres()}`,
      });
    });
    it('should not link app and return to home page', async () => {
      await element(by.text(no)).tap();
      await expectHomescreen();
    });
    it('should link app and see Linked label in front of app', async () => {
      await element(by.text(yes)).tap();
      await expectAppsScreen(true);
      expect(element(by.id('Linked_ethereum'))).toNotExist();
      await waitFor(element(by.text('OK')))
        .toExist()
        .withTimeout(20000);
      await element(by.text('OK')).tap();
      expect(element(by.id('Linked_ethereum'))).toBeVisible();
    });
  });
});

xdescribe('Apps Screen', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    // await createBrightID();
  });
  it('should open apps screen', async () => {
    await element(by.id('appsBtn')).tap();
    await expectAppsScreen(true);
  });
  it('should show all apps', async () => {
    let response = await fetch('http://test.brightid.org/brightid/v5/apps');
    let json = await response.json();
    const { apps } = json.data;
    apps.forEach((app) => {
      expect(element(by.text(app.name))).toBeVisible();
    });
  });
});
