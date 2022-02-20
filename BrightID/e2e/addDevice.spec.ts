/*
E2E Test add device:
- test script: Create channel, upload fake data and create according URL
- Detox: Prepare account
- Detox: Inject qrcode into app
- Detox: walk through "Add device" screens
- test script: Verify correct data is uploaded to channel
- Detox: verify new device is visible in devices list after refresh

 */
import { by, element, expect } from 'detox';
import nacl from 'tweetnacl';
import B64 from 'base64-js';
import ChannelAPI from '../src/api/channelService';
import { createBrightID } from './testUtils';
import { hash } from '@/utils/encoding';

describe('Add Device', () => {
  const profileServerUrl = 'http://test.brightid.org/profile';
  let channelApi: ChannelAPI;
  let recoveryData: {
    aesKey: string;
    publicKey: string;
    timestamp: number;
  };
  let qrUrl: URL;
  let yes: string;
  let no: string;

  beforeAll(async () => {
    const platform = await device.getPlatform();
    const android = platform === 'android';
    no = android ? 'NO' : 'No';
    yes = android ? 'YES' : 'Yes';

    // created with https://ed25519.herokuapp.com/
    const publicKey = '0e6ta650W8E/QY+7E5B1id0l5veLflnsKG8FotasAh4=';
    const secretKey =
      '8OTC92xYkW7CWPJGhRvqCR0U1CR6L8PhhpRGGxgW4TvR7q1rrnRbwT9Bj7sTkHWJ3SXm94t+WewobwWi1qwCHg==';
    const aesKey = `${Date.now()}000`; // padded to 16 chars

    await createBrightID();

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
    console.log(`Finished uploading recovery data to channel ${channelId}`);
    qrUrl = new URL(url.href);
    qrUrl.searchParams.append('aes', recoveryData.aesKey);
    qrUrl.searchParams.append('t', 3);
    console.log(`new qrCode url: ${qrUrl.href}`);
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
    await expect(element(by.id('DevicesScreen'))).toBeVisible();
    // new device name should be listed on screen
    await expect(element(by.text(deviceName))).toBeVisible();

    // node api should return
  });
});
