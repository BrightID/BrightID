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
import { IMPORT_PREFIX, RECOVERY_CHANNEL_TTL } from '@/utils/constants';

export const getUserInfo = async (user) => {
  const photo = await retrieveImage(user.photo.filename);
  return {
    id: user.id,
    name: user.name,
    photo,
    isSponsored: user.isSponsored,
    isSponsoredv6: user.isSponsoredv6,
    backupCompleted: user.backupCompleted,
    password: user.password,
    updateTimestamps: user.updateTimestamps,
  };
};

export const uploadAllInfoAfter =
  (after): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    const {
      user,
      keypair: { publicKey: signingKey },
      groups: { groups },
      recoveryData: {
        channel: { url, channelId },
        aesKey,
      },
      settings: { isPrimaryDevice },
    } = getState();
    // use keypair for sync and recovery for import
    const channelApi = new ChannelAPI(url.href);

    console.log('uploading user info');

    const encrypted = encryptData(await getUserInfo(user), aesKey);
    const userDataId = `${IMPORT_PREFIX}userinfo_${user.id}:${b64ToUrlSafeB64(
      signingKey,
    )}`;
    await channelApi.upload({
      channelId,
      dataId: userDataId,
      data: encrypted,
    });

    console.log('uploading connections');
    const connections = selectAllConnections(getState()).filter(
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
    const linkedContexts = selectAllLinkedContexts(getState()).filter(
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
      const sigs = selectAllSigs(getState());
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

export const uploadDeviceInfo =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const {
      recoveryData: {
        channel: { url, channelId },
        publicKey: signingKey,
      },
      settings: { lastSyncTime, isPrimaryDevice },
    } = getState();
    const dataObj: SyncDeviceInfo = {
      signingKey,
      lastSyncTime,
      isPrimaryDevice,
    };
    const data = JSON.stringify(dataObj);
    const channelApi = new ChannelAPI(url.href);
    await channelApi.upload({
      channelId,
      data,
      dataId: `${IMPORT_PREFIX}data`,
      requestedTtl: RECOVERY_CHANNEL_TTL,
    });
  };
