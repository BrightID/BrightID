import { store } from '@/store';
import { b64ToUrlSafeB64 } from '@/utils/encoding';
import { encryptData } from '@/utils/cryptoHelper';
import { retrieveImage } from '@/utils/filesystem';
import { selectAllConnections } from '@/reducer/connectionsSlice';
import { selectAllLinkedContexts, selectAllSigs } from '@/reducer/appsSlice';
import ChannelAPI from '@/api/channelService';
import {
  uploadBlindSig,
  uploadConnection,
  uploadContextInfo,
  uploadGroup,
} from '@/utils/channels';
import { IMPORT_PREFIX } from '@/utils/constants';

export const uploadAllInfoAfter = async (after) => {
  const {
    user,
    keypair: { publicKey: signingKey },
    groups: { groups },
    recoveryData: {
      channel: { url, channelId },
      aesKey,
    },
    settings: { isPrimaryDevice },
  } = store.getState();
  // use keypair for sync and recovery for import
  const channelApi = new ChannelAPI(url.href);

  console.log('uploading user info');
  const photo = await retrieveImage(user.photo.filename);
  const data = {
    id: user.id,
    name: user.name,
    photo,
    isSponsored: user.isSponsored,
    backupCompleted: user.backupCompleted,
    password: user.password,
    updateTimestamps: user.updateTimestamps,
  };

  const encrypted = encryptData(data, aesKey);
  const userDataId = `${IMPORT_PREFIX}userinfo_${user.id}:${b64ToUrlSafeB64(
    signingKey,
  )}`;
  await channelApi.upload({
    channelId,
    dataId: userDataId,
    data: encrypted,
  });

  console.log('uploading connections');
  const connections = selectAllConnections(store.getState()).filter(
    (conn) => conn.timestamp > after,
  );
  for (const conn of connections) {
    await uploadConnection({
      conn,
      channelApi,
      aesKey,
      signingKey,
    });
  }

  console.log('uploading groups');
  for (const group of groups) {
    if (group.joined > after) {
      await uploadGroup({
        group,
        channelApi,
        aesKey,
        signingKey,
      });
    }
  }

  console.log('uploading linked contexts');
  const linkedContexts = selectAllLinkedContexts(store.getState()).filter(
    (linkedContext) =>
      linkedContext.dateAdded > after && linkedContext.state === 'applied',
  );
  for (const contextInfo of linkedContexts) {
    await uploadContextInfo({
      contextInfo,
      channelApi,
      aesKey,
      signingKey,
      prefix: IMPORT_PREFIX,
    });
  }

  console.log('uploading blind sigs');
  if (isPrimaryDevice) {
    const sigs = selectAllSigs(store.getState());
    for (const sig of sigs) {
      if (sig.signedTimestamp > after || sig.linkedTimestamp > after) {
        await uploadBlindSig({
          sig,
          channelApi,
          aesKey,
          signingKey,
          prefix: IMPORT_PREFIX,
        });
      }
    }
  }

  console.log('uploading completed flag');
  const completeDataId = `${IMPORT_PREFIX}completed_${
    user.id
  }:${b64ToUrlSafeB64(signingKey)}`;
  await channelApi.upload({
    channelId,
    dataId: completeDataId,
    data: 'completed',
  });
};

export const uploadDeviceInfo = async () => {
  const {
    recoveryData: {
      channel: { url, channelId },
      publicKey: signingKey,
    },
    settings: { lastSyncTime, isPrimaryDevice },
  } = store.getState();
  const dataObj: SyncDeviceInfo = { signingKey, lastSyncTime, isPrimaryDevice };
  const data = JSON.stringify(dataObj);
  const channelApi = new ChannelAPI(url.href);
  await channelApi.upload({
    channelId,
    data,
    dataId: `${IMPORT_PREFIX}data`,
  });
};
