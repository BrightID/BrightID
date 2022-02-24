import { store } from '@/store';
import { b64ToUrlSafeB64, hash } from '@/utils/encoding';
import { encryptData } from '@/utils/cryptoHelper';
import { retrieveImage } from '@/utils/filesystem';
import { selectAllConnections } from '@/reducer/connectionsSlice';
import { selectAllSigs } from '@/reducer/appsSlice';
import ChannelAPI from '@/api/channelService';
import { uploadConnection, uploadGroup } from '@/utils/channels';

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
  await channelApi.upload({
    channelId,
    dataId: `userinfo_${user.id}:${b64ToUrlSafeB64(signingKey)}`,
    data: encrypted,
  });

  console.log('uploading connections');
  const connections = selectAllConnections(store.getState());
  for (const conn of connections) {
    if (conn.timestamp > after) {
      await uploadConnection({ conn, channelApi, aesKey, signingKey });
    }
  }

  console.log('uploading groups');
  for (const group of groups) {
    if (group.joined > after) {
      await uploadGroup({ group, channelApi, aesKey, signingKey });
    }
  }

  console.log('uploading blind sigs');
  if (isPrimaryDevice) {
    const sigs = selectAllSigs(store.getState());
    for (const sig of sigs) {
      if (sig.signedTimestamp > after || sig.linkedTimestamp > after) {
        await uploadBlindSig({ sig, channelApi, aesKey });
      }
    }
  }

  console.log('uploading completed flag');
  await channelApi.upload({
    channelId,
    dataId: `completed_${user.id}:${b64ToUrlSafeB64(signingKey)}`,
    data: 'completed',
  });
};

const uploadBlindSig = async ({
  sig,
  channelApi,
  aesKey,
}: {
  sig: SigInfo;
  channelApi: ChannelAPI;
  aesKey: string;
}) => {
  const {
    keypair: { publicKey: signingKey },
  } = store.getState();
  try {
    const encrypted = encryptData(sig, aesKey);
    console.log(
      `Posting blind sig for app: ${sig.app} verification: ${sig.verification} ...`,
    );
    await channelApi.upload({
      channelId: hash(aesKey),
      data: encrypted,
      // use hash of sig.uid to avoid revealing it
      dataId: `blindsig_${hash(sig.uid)}:${b64ToUrlSafeB64(signingKey)}`,
    });
  } catch (err) {
    console.error(`uploadBlindSig: ${err.message}`);
  }
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
    dataId: 'data',
  });
};
