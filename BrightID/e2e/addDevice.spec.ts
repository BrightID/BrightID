/*
E2E Test add device:
- Detox: Prepare account
- test script: Create channel, upload fake data and create according URL
- Detox: Inject qrcode into app
- Detox: walk through "Add device" screens
- Detox: verify new device is visible in devices list after refresh
- test script: Verify new signingkey is set via NodeAPI
 */
import { by, element, expect } from 'detox';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect as jestExpect } from '@jest/globals';
import ChannelAPI from '../src/api/channelService';
import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  expectHomescreen,
  navigateHome,
} from './testUtils';
import { hash } from '@/utils/encoding';
import { NodeApi } from '@/api/brightId';

describe('Add Device', () => {
  const profileServerUrl = 'http://test.brightid.org/profile';
  const apiUrl = 'http://test.brightid.org';
  let channelApi: ChannelAPI;
  let recoveryData: {
    aesKey: string;
    publicKey: string;
    timestamp: number;
  };
  let qrUrl: URL;
  let yes: string;
  let no: string;
  let apiInstance: NodeApi;
  let userBrightId: string;
  let firstSigningKey: string;

  beforeAll(async () => {
    const platform = await device.getPlatform();
    const android = platform === 'android';
    no = android ? 'NO' : 'No';
    yes = android ? 'YES' : 'Yes';

    // prepare nodeAPI instance
    apiInstance = new NodeApi({
      url: apiUrl,
      id: undefined,
      secretKey: undefined,
    });

    // create user
    userBrightId = await createBrightID();
    console.log(`User BrightID: ${userBrightId}`);
    jestExpect(userBrightId).toBeDefined();

    // add a connection, so the user is actually created on the backend
    await createFakeConnection();
    // make sure all connections are established
    await element(by.id('connectionsBtn')).tap();
    await expectConnectionsScreen();
    await waitFor(element(by.id('connection-0')))
      .toExist()
      .withTimeout(20000);
    await navigateHome();
    await expectHomescreen();

    // prepare recovery channel
    // created with https://ed25519.herokuapp.com/
    const publicKey = '0e6ta650W8E/QY+7E5B1id0l5veLflnsKG8FotasAh4=';
    const secretKey =
      '8OTC92xYkW7CWPJGhRvqCR0U1CR6L8PhhpRGGxgW4TvR7q1rrnRbwT9Bj7sTkHWJ3SXm94t+WewobwWi1qwCHg==';
    const aesKey = `${Date.now()}000`; // padded to 16 chars

    // setup minimal recovery data
    recoveryData = {
      aesKey,
      publicKey,
      timestamp: Date.now(),
    };
    const url = new URL(profileServerUrl);
    channelApi = new ChannelAPI(url.href);
    const channelId = hash(recoveryData.aesKey);
    const dataObj = {
      signingKey: recoveryData.publicKey,
      timestamp: recoveryData.timestamp,
    };
    const data = JSON.stringify(dataObj);
    await channelApi.upload({
      channelId,
      data,
      dataId: 'data',
    });
    qrUrl = new URL(url.href);
    qrUrl.searchParams.append('aes', recoveryData.aesKey);
    qrUrl.searchParams.append('t', '3');
    // console.log(`new qrCode url: ${qrUrl.href}`);
  });

  it('user should have one signingkey', async () => {
    const { signingKeys } = await apiInstance.getProfile(userBrightId);
    jestExpect(signingKeys.length).toBe(1);
    [firstSigningKey] = signingKeys;
  });

  it('should add another device', async () => {
    const deviceName = 'TestDevice';
    const deepLink = `brightid://connection-code/${encodeURIComponent(
      qrUrl.href,
    )}`;
    await device.launchApp({
      newInstance: false,
      url: deepLink,
    });

    // Alert should be open
    await expect(element(by.text('Please Confirm'))).toBeVisible();
    // Confirm importing device
    await element(by.text(yes)).tap();
    // Add device screen should be open
    await expect(element(by.id('AddDeviceScreen'))).toBeVisible();

    // set device name and submit
    await expect(element(by.id('editDeviceName'))).toExist();
    await element(by.id('editDeviceName')).tap();
    await element(by.id('editDeviceName')).replaceText(deviceName);
    await element(by.id('editDeviceName')).tapReturnKey();
    await expect(element(by.id('submitDeviceName'))).toExist();
    await element(by.id('submitDeviceName')).tap();

    // should be on Devices screen after submitting
    await waitFor(element(by.id('homeScreen')))
      .toBeVisible()
      .withTimeout(20000);

    // new device name should be listed on screen
    await expect(element(by.id(deviceName))).toBeVisible();
  });

  // TODO: This test fails because client is not waiting for the 'addSigningKey' operation to be applied
  it('user should have two signingkeys', async () => {
    const { signingKeys } = await apiInstance.getProfile(userBrightId);
    jestExpect(signingKeys.length).toBe(2);
  });
});
