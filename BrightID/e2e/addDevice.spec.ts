/*
E2E Test add device:
- Detox: Prepare account
- test script: Create channel, upload fake device data to import and create according URL
- Detox: Inject qrcode into app
- Detox: walk through "Add device" screens
- Detox: verify new device is visible in devices list after refresh
- test script: Verify new signingkey is set via NodeAPI
 */
import { by, element, expect } from 'detox';
import { expect as jestExpect } from '@jest/globals';
import nacl from 'tweetnacl';
import ChannelAPI from '../src/api/channelService';
import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  expectHomescreen,
  navigateHome,
  operationTimeout,
} from './testUtils';
import {
  b64ToUrlSafeB64,
  hash,
  uInt8ArrayToB64,
  urlSafeRandomKey,
} from '@/utils/encoding';
import { NodeApi } from '@/api/brightId';
import { DEEP_LINK_PREFIX } from '@/utils/constants';

describe('Add Device', () => {
  // http://test.brightid
  const profileServerUrl = 'http://test.brightid.org/profile';
  // const profileServerUrl = 'http://127.0.0.1:3000';
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
    const userData = await createBrightID();
    userBrightId = userData.brightId;
    console.log(`User BrightID: ${userBrightId}`);
    jestExpect(userBrightId).toBeDefined();

    // add a connection, so the user is actually created on the backend
    await createFakeConnection();
    // make sure all connections are established
    await element(by.id('connectionsBtn')).tap();
    await expectConnectionsScreen();
    await waitFor(element(by.id('connection-0')))
      .toExist()
      .withTimeout(operationTimeout);
    await navigateHome();
    await expectHomescreen();

    // create new signingkey to be added
    const { publicKey, secretKey } = await nacl.sign.keyPair();

    // setup minimal recovery data
    const aesKey = await urlSafeRandomKey(16);
    recoveryData = {
      aesKey,
      publicKey: uInt8ArrayToB64(publicKey),
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
    // Android emulator has well-known alias of 10.0.2.2 routing to localhost where emulator is running
    if (qrUrl.host === '127.0.0.1:3000') {
      console.log(`Patching localhost to 10.0.2.2...`);
      qrUrl.host = '10.0.2.2:3000';
    }
  });

  it('user should have one signingkey', async () => {
    const { signingKeys } = await apiInstance.getProfile(userBrightId);
    jestExpect(signingKeys.length).toBe(1);
    [firstSigningKey] = signingKeys;
    jestExpect(b64ToUrlSafeB64(firstSigningKey)).toEqual(userBrightId);
  });

  it('should add another device', async () => {
    const deviceName = 'TestDevice';
    const deepLink = `${DEEP_LINK_PREFIX}connection-code/${encodeURIComponent(
      qrUrl.href,
    )}`;
    console.log(`Deeplink: ${deepLink}`);
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

    // should be on Devices screen when upload is finished and operation got applied.
    await waitFor(element(by.id('DevicesScreen')))
      .toBeVisible()
      .withTimeout(40000);

    // new device name should be listed on screen
    await expect(element(by.id(deviceName))).toBeVisible();
  });

  it('user should have two correct signingkeys', async () => {
    const { signingKeys } = await apiInstance.getProfile(userBrightId);
    console.log(signingKeys);
    jestExpect(signingKeys.length).toBe(2);
    jestExpect(signingKeys.indexOf(firstSigningKey)).toBeGreaterThanOrEqual(0);
    jestExpect(
      signingKeys.indexOf(recoveryData.publicKey),
    ).toBeGreaterThanOrEqual(0);
  });
});
