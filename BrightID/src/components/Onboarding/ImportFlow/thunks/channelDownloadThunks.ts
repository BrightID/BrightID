import { b64ToUrlSafeB64 } from '@/utils/encoding';
import { saveImage } from '@/utils/filesystem';
import { addLinkedContext, upsertSig } from '@/reducer/appsSlice';
import { decryptData } from '@/utils/cryptoHelper';
import {
  setUploadCompletedBy,
  setRecoveryId,
} from '../../RecoveryFlow/recoveryDataSlice';
import {
  setPhoto,
  setName,
  setIsSponsored,
  setBackupCompleted,
  setPassword,
} from '@/reducer/userSlice';
import ChannelAPI from '@/api/channelService';
import { IMPORT_PREFIX } from '@/utils/constants';

export const downloadContextInfo =
  ({
    channelApi,
    dataIds,
  }: {
    channelApi: ChannelAPI;
    dataIds: Array<string>;
  }) =>
  async (dispatch: dispatch, getState: getState) => {
    try {
      const {
        recoveryData: {
          aesKey,
          channel: { channelId },
        },
      } = getState();

      const isContextInfo = (id: string) =>
        id.startsWith(`${IMPORT_PREFIX}contextInfo_`);

      const contextInfoDataIds = dataIds.filter((dataId) =>
        isContextInfo(dataId),
      );

      for (const dataId of contextInfoDataIds) {
        const encrypted = await channelApi.download({ channelId, dataId });
        const contextInfo = decryptData(encrypted, aesKey) as ContextInfo;
        console.log(`ContextInfo:`);
        console.log(contextInfo);
        dispatch(addLinkedContext(contextInfo));
      }
      return contextInfoDataIds.length;
    } catch (err) {
      console.error(`downloadingBlindSigs: ${err.message}`);
    }
  };

export const downloadBlindSigs =
  ({
    channelApi,
    dataIds,
  }: {
    channelApi: ChannelAPI;
    dataIds: Array<string>;
  }) =>
  async (dispatch: dispatch, getState: getState) => {
    try {
      const {
        recoveryData: {
          aesKey,
          channel: { channelId },
        },
      } = getState();

      const isBlindSig = (id: string) =>
        id.startsWith(`${IMPORT_PREFIX}blindsig_`);
      const blindSigDataIds = dataIds.filter((dataId) => isBlindSig(dataId));

      for (const dataId of blindSigDataIds) {
        const encrypted = await channelApi.download({ channelId, dataId });
        const blindSigData = decryptData(encrypted, aesKey) as SigInfo;
        dispatch(upsertSig(blindSigData));
      }
      return blindSigDataIds.length;
    } catch (err) {
      console.error(`downloadingBlindSigs: ${err.message}`);
    }
  };

export const downloadUserInfo =
  ({
    channelApi,
    dataIds,
  }: {
    channelApi: ChannelAPI;
    dataIds: Array<string>;
  }) =>
  async (dispatch: dispatch, getState: getState) => {
    try {
      const {
        keypair: { publicKey: signingKey },
        recoveryData: {
          aesKey,
          channel: { channelId },
        },
        user: { updateTimestamps },
      } = getState();

      const prefix = `${IMPORT_PREFIX}userinfo_`;
      const isUserInfo = (id: string) => id.startsWith(prefix);
      const uploader = (id) => id.replace(prefix, '').split(':')[1];
      const userInfoDataId = dataIds.find(
        (dataId) =>
          isUserInfo(dataId) &&
          uploader(dataId) !== b64ToUrlSafeB64(signingKey),
      );
      if (!userInfoDataId) {
        return false;
      }

      const encrypted = await channelApi.download({
        channelId,
        dataId: userInfoDataId,
      });
      const info = decryptData(encrypted, aesKey);
      dispatch(setRecoveryId(info.id));
      if (
        !updateTimestamps.name ||
        info.updateTimestamps.name > updateTimestamps.name
      ) {
        dispatch(setName(info.name));
      }
      if (
        !updateTimestamps.photo ||
        info.updateTimestamps.photo > updateTimestamps.photo
      ) {
        const filename = await saveImage({
          imageName: info.id,
          base64Image: info.photo,
        });
        info.photo = { filename };
        dispatch(setPhoto(info.photo));
      }
      if (
        !updateTimestamps.isSponsored ||
        info.updateTimestamps.isSponsored > updateTimestamps.isSponsored
      ) {
        dispatch(setIsSponsored(info.isSponsored));
      }
      if (
        !updateTimestamps.password ||
        info.updateTimestamps.password > updateTimestamps.password
      ) {
        dispatch(setPassword(info.password));
      }
      if (
        !updateTimestamps.backupCompleted ||
        info.updateTimestamps.backupCompleted > updateTimestamps.backupCompleted
      ) {
        dispatch(setBackupCompleted(info.backupCompleted));
      }
      return true;
    } catch (err) {
      console.error(`downloadingUserInfo: ${err.message}`);
    }
  };

export const checkCompletedFlags =
  ({ dataIds }: { channelApi: ChannelAPI; dataIds: Array<string> }) =>
  async (dispatch: dispatch, getState: getState) => {
    try {
      const {
        keypair: { publicKey: signingKey },
        recoveryData: { uploadCompletedBy },
      } = getState();

      const prefix = `${IMPORT_PREFIX}completed_`;
      const isCompleted = (id: string) => id.startsWith(prefix);
      const completedBy = (id: string) => id.replace(prefix, '');
      const uploader = (id) => id.replace(prefix, '').split(':')[1];

      const completedDataIds = dataIds.filter(
        (dataId) =>
          isCompleted(dataId) &&
          uploader(dataId) !== b64ToUrlSafeB64(signingKey) &&
          !uploadCompletedBy[completedBy(dataId)],
      );

      for (const dataId of completedDataIds) {
        const uploader = completedBy(dataId);
        dispatch(setUploadCompletedBy(uploader));
      }
    } catch (err) {
      console.error(`checkingCompletedFlags: ${err.message}`);
    }
  };
