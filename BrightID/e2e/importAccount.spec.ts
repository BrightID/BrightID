import { by, element, expect } from 'detox';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect as jestExpect } from '@jest/globals';
import i18next from 'i18next';
import ChannelAPI from '../src/api/channelService';
import {
  acceptEula,
  clearData,
  createBrightID,
  createFakeConnection,
  createGroup,
  expectAppsScreen,
  expectConnectionsScreen,
  expectHomescreen,
  getGroupKeys,
  joinAllGroups,
  navigateGroupsScreen,
  navigateHome,
  operationTimeout,
} from './testUtils';
import { NodeApi } from '@/api/brightId';
import { b64ToUrlSafeB64, hash } from '@/utils/encoding';
import { loadRecoveryData } from '@/utils/recovery';
import { encryptData } from '@/utils/cryptoHelper';
import {
  uploadConnection,
  uploadContextInfo,
  uploadGroup,
} from '@/utils/channels';
import { IMPORT_PREFIX } from '@/utils/constants';

const apiUrl = 'http://test.brightid.org';

const uploadDataToChannel = async (
  channelApi: ChannelAPI,
  channelId: string,
  dataId: string,
  data: Record<string, unknown>,
  aesKey: string,
) => {
  const encrypted = encryptData(data, aesKey);
  await channelApi.upload({
    channelId,
    dataId,
    data: encrypted,
  });
};

describe('Import BrightID', () => {
  let brightId: string;
  let secretKey: Uint8Array;
  let publicKey: string;
  let apiInstance: NodeApi;
  const fakeConnectionIds: Array<string> = [];
  const groupNames = ['Group one', 'Group two'];
  let groupKeys: Array<{ id: string; aesKey: string }> = [];
  const apps: { appId: string; contextInfo: ContextInfo }[] = [
    {
      appId: 'ethereum',
      contextInfo: {
        context: 'ethereum',
        contextId: '0xB0008ADAFF0DDC5D03652944D28A0F246E5D46A3',
        dateAdded: 1648459346910,
        state: 'applied',
      },
    },
    {
      appId: 'Gitcoin',
      contextInfo: {
        context: 'Gitcoin',
        contextId: '0x1CF62DC276BC71AFC700E4DB9BA7B932F6DB3621',
        dateAdded: 1648463194129,
        state: 'applied',
      },
    },
    {
      appId: '1hive',
      contextInfo: {
        context: '1hive',
        contextId: '0x82978C22A3FF7AF9276AC0FA4D48DD8FE2C123DF',
        dateAdded: 1648463298792,
        state: 'applied',
      },
    },
  ];

  describe(`Prepare BrightID to be imported`, () => {
    beforeAll(async () => {
      await device.launchApp();
    });

    afterAll(async () => {
      // clear all data in app
      await clearData();
    });

    it('should create a brightID', async () => {
      const userData = await createBrightID();
      brightId = userData.brightId;
      secretKey = userData.secretKey;
      publicKey = userData.publicKey;
      console.log(
        `Original BrightID: ${brightId}, PublicKey: ${publicKey}, SecretKey: ${secretKey}`,
      );
    });

    it('should add connections', async () => {
      // add 3 connections
      fakeConnectionIds.push(await createFakeConnection());
      fakeConnectionIds.push(await createFakeConnection());
      fakeConnectionIds.push(await createFakeConnection());
      // make connections are established
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
      await waitFor(element(by.id('connection-0')))
        .toExist()
        .withTimeout(operationTimeout);
      await waitFor(element(by.id('connection-1')))
        .toExist()
        .withTimeout(operationTimeout);
      await waitFor(element(by.id('connection-2')))
        .toExist()
        .withTimeout(operationTimeout);
      await navigateHome();
    });

    it('should add groups', async () => {
      await createGroup(groupNames[0], [0, 1]);
      await createGroup(groupNames[1], [1, 2]);

      groupKeys = await getGroupKeys(2);
      console.log('Groups:');
      console.log(groupKeys);

      // accept group invitations
      await joinAllGroups(0);
      await joinAllGroups(1);
      await joinAllGroups(2);
    });
  });

  /*
    1. startup client
    2. click "Import" instead of creating a new brightId
    3. Obtain import channel QRCode via testscript (e.g. http://test.brightid.org/profile?aes=5LI8B-23Ax9rBGq-87dv9Q&t=3 )
    4. testscript uploads fake account data to channel
    5. client should detect data, import it and proceed to homescreen
   */
  describe('import BrightID', () => {
    beforeAll(async () => {
      await acceptEula();
      await expect(element(by.id('OnboardScreen'))).toBeVisible();
      await expect(element(by.id('importBrightID'))).toExist();
      await element(by.id('importBrightID')).tap();

      // prepare nodeAPI instance with user credentials
      apiInstance = new NodeApi({
        url: apiUrl,
        id: brightId,
        secretKey,
      });
    });

    it('should create import channel and upload data', async () => {
      // should be on Import Account screen with QRCode. Allow a few seconds for the qrcode to appear.
      await waitFor(element(by.id('qrcode')))
        .toBeVisible()
        .withTimeout(30000);
      // get qrcode
      const attributes = await element(by.id('qrcode')).getAttributes();
      // @ts-ignore Property 'text' does not exist on type '{ elements: IosElementAttributes[]; }'
      const qrUrl = attributes.text;
      console.log(`Got import qrcode: ${qrUrl}`);

      // create channel instance to load import/recovery data
      const channelURL = new URL(qrUrl);
      // Android emulator has well-known alias of 10.0.2.2 routing to localhost where emulator is running
      if (channelURL.host === '10.0.2.2:3000') {
        console.log(`Patching 10.0.2.2 to 127.0.0.1...`);
        channelURL.host = '127.0.0.1:3000';
        console.log(channelURL);
      }
      // Pop 'type' parameter from url
      channelURL.searchParams.delete('t');
      // Pop 'aes' parameter from url
      const aesKey = channelURL.searchParams.get('aes');
      channelURL.searchParams.delete('aes');
      // Pop 'p' parameter from url
      channelURL.searchParams.delete('p');

      // calculate channelId based on aeskey
      const channelId = hash(aesKey);
      console.log(`ChannelID: ${channelId}`);
      const channelApi = new ChannelAPI(channelURL.href);

      // obtain new signingkey from channel
      const { signingKey } = await loadRecoveryData(channelApi, aesKey);
      console.log(`SigningKey: ${signingKey}`);
      const op = await apiInstance.addSigningKey(signingKey);
      console.log(`OpHash: ${op.hash}`);
      // wait until op is applied in backend
      await new Promise((r) => setTimeout(r, operationTimeout));
      const opInfo: OperationInfo = await apiInstance.getOperationState(
        op.hash,
      );
      console.log(`OpState: ${opInfo.state}`);
      console.log(`OpResult: ${opInfo.result}`);
      jestExpect(opInfo.state).toBe('applied');

      // upload minimum userInfo required for import
      const userData = {
        id: brightId,
        name: 'Quentin',
        photo: photoData,
        isSponsored: false,
        isSponsoredv6: false,
        backupCompleted: false,
        password: '',
        updateTimestamps: {
          backupCompleted: 0,
          isSponsored: 0,
          isSponsoredv6: 0,
          photo: 0,
          name: 0,
          password: 0,
        },
      };
      const dataId = `${IMPORT_PREFIX}userinfo_${brightId}:${b64ToUrlSafeB64(
        publicKey,
      )}`;
      await uploadDataToChannel(
        channelApi,
        channelId,
        dataId,
        userData,
        aesKey,
      );

      for (const fakeConnectionId of fakeConnectionIds) {
        const conn = {
          id: fakeConnectionId,
          name: fakeConnectionId,
          photo: {
            filename: 'testphoto.jpg',
          },
          timestamp: 1645628152000,
        };
        await uploadConnection({
          conn,
          channelApi,
          aesKey,
          signingKey,
        });
      }

      for (let groupIndex = 0; groupIndex < groupKeys.length; groupIndex++) {
        const group = {
          id: groupKeys[groupIndex].id,
          aesKey: groupKeys[groupIndex].aesKey,
          name: groupNames[groupIndex],
          members: [],
          admins: [],
        };
        await uploadGroup({
          group,
          channelApi,
          aesKey,
          signingKey,
        });
      }

      // upload ContextInfos
      for (const app of apps) {
        await uploadContextInfo({
          contextInfo: app.contextInfo,
          channelApi,
          aesKey,
          signingKey,
          prefix: IMPORT_PREFIX,
        });
      }

      // upload "completed" flag
      await channelApi.upload({
        channelId,
        dataId: `${IMPORT_PREFIX}completed_${brightId}:${b64ToUrlSafeB64(
          publicKey,
        )}`,
        data: 'completed',
      });
    });

    it('should import uploaded apps data', async () => {
      // check that all imported linked Context show app as linked
      for (const app of apps) {
        await expectHomescreen();
        await element(by.id('appsBtn')).tap();
        await expectAppsScreen();
        await waitFor(element(by.id(`Linked_${app.appId}`)))
          .toBeVisible()
          .whileElement(by.id('appsList'))
          .scroll(50, 'down');
        await navigateHome();
      }
    });

    it('should import uploaded connections data', async () => {
      // should be on homescreen
      await expectHomescreen();
      // there should be three connections
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
      await waitFor(element(by.id('connection-0')))
        .toExist()
        .withTimeout(operationTimeout);
      await waitFor(element(by.id('connection-1')))
        .toExist()
        .withTimeout(operationTimeout);
      await waitFor(element(by.id('connection-2')))
        .toExist()
        .withTimeout(operationTimeout);
      await navigateHome();
    });

    it('should import uploaded groups data', async () => {
      await navigateGroupsScreen();

      // trigger refresh
      await element(by.id('groupsScreen')).swipe('down', 'fast');
      // all groups should be there
      for (let index = 0; index < groupKeys.length; index++) {
        await expect(element(by.id(`groupItem-${index}`))).toBeVisible();
      }

      // check if correct ID and AESKey are set
      await navigateHome();
      const importedGroupKeys = await getGroupKeys(2);
      for (let index = 0; index < groupKeys.length; index++) {
        // arrays are in random order, so first find the correct entry in importedGroups
        const importedGroup = importedGroupKeys.find(
          (g) => g.id === groupKeys[index].id,
        );
        jestExpect(importedGroup).toMatchObject(groupKeys[index]);
      }
    });

    // If dismissing a group member works, I am admin
    it('should be group admin after importing', async () => {
      const actionSheetTitle = i18next.t('common.actionSheet.title');
      const actionTitle = i18next.t('groups.memberActionSheet.dismissMember');
      const actionOK = i18next.t('common.alert.ok');

      await navigateGroupsScreen();
      // open first group
      await element(by.id('groupItem-0')).tap();
      // Group should have 3 members, so check for memberItem with index 2
      await expect(element(by.id('memberItem-2'))).toBeVisible();

      // Open context menu of first regular user
      await element(by.id('memberContextBtn').withAncestor(by.id('regular')))
        .atIndex(0)
        .tap();

      // ActionSheet does not support testID, so match based on text.
      await waitFor(element(by.text(actionSheetTitle))).toBeVisible();
      await element(by.text(actionTitle)).tap();
      // dismiss confirmation screen
      await element(by.text(actionOK)).tap();

      // wait until all dismiss op should be done on the backend
      await new Promise((r) => setTimeout(r, operationTimeout));

      // should be back on groups members screen, dismissed member should be removed
      // so the last index should be 1
      await expect(element(by.id('memberItem-1'))).toBeVisible();
      await expect(element(by.id('memberItem-2'))).not.toBeVisible();

      // Go back to homescreen.
      await element(by.id('NavBackBtn')).tap();
      await navigateHome();
    });
  });
});

const base64Photo =
  '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';
const photoData = `data:image/jpeg;base64,${base64Photo}`;
