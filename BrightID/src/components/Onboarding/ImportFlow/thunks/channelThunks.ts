import { hash, urlSafeRandomKey } from '@/utils/encoding';
import { store } from '@/store';
import ChannelAPI from '@/api/channelService';
import { selectBaseUrl } from '@/reducer/settingsSlice';
import { CHANNEL_POLL_INTERVAL } from '../../RecoveryFlow/thunks/channelThunks';
import { init, setRecoveryChannel } from '../../RecoveryFlow/recoveryDataSlice';
import {
  downloadConnections,
  downloadGroups,
} from '../../RecoveryFlow/thunks/channelDownloadThunks';
import {
  checkCompletedFlags,
  downloadBlindSigs,
  downloadContextInfo,
  downloadUserInfo,
} from './channelDownloadThunks';
import { uploadAllInfoAfter, uploadDeviceInfo } from './channelUploadThunks';
import { IMPORT_PREFIX } from '@/utils/constants';

export const setupSync =
  () => async (dispatch: dispatch, getState: getState) => {
    const { recoveryData } = getState();
    // setup recovery data
    if (!recoveryData.aesKey) {
      const aesKey = await urlSafeRandomKey(16);
      // setup recovery data slice with sync info
      dispatch(init({ aesKey }));
    }
  };

export const createSyncChannel =
  () => async (dispatch: dispatch, getState: getState) => {
    const {
      recoveryData: { aesKey },
    } = getState();
    const baseUrl = selectBaseUrl(getState());
    const url = new URL(`${baseUrl}/profile`);
    const channelId = hash(aesKey);
    console.log(`created channel ${channelId} for sync data`);
    dispatch(setRecoveryChannel({ channelId, url }));
    const { settings } = getState();
    let lastSyncTime = 0;
    if (!settings.isPrimaryDevice) {
      await uploadDeviceInfo();
      console.log(
        `Finished uploading last sync time to the channel ${channelId}`,
      );
    } else {
      console.log(
        `Polling last sync time from the scanner of the channel ${channelId}`,
      );
      lastSyncTime = (await pollOtherSideDeviceInfo()).lastSyncTime;
      console.log(`Last sync time was ${lastSyncTime}`);
    }
    const after = settings.isPrimaryDevice
      ? lastSyncTime
      : settings.lastSyncTime;
    uploadAllInfoAfter(after).then(() => {
      console.log(`Finished uploading sync data to the channel ${channelId}`);
    });
  };

export const getOtherSideDeviceInfo = async (): Promise<SyncDeviceInfo> => {
  const {
    recoveryData: {
      channel: { url, channelId },
    },
  } = store.getState();
  const channelApi = new ChannelAPI(url.href);
  try {
    const dataString = await channelApi.download({
      channelId,
      dataId: `${IMPORT_PREFIX}data`,
      deleteAfterDownload: true,
    });
    return JSON.parse(dataString) as SyncDeviceInfo;
  } catch (err) {
    // TODO: handle real errors, like network issues etc?
    // if other side (code generator) did not push its info, it was primary.
    return {
      isPrimaryDevice: true,
    };
  }
};

export const pollOtherSideDeviceInfo = async (): Promise<SyncDeviceInfo> => {
  // TODO: This is an endless loop. Needs refactoring and error handling.
  let data = await getOtherSideDeviceInfo();
  while (data.lastSyncTime === undefined) {
    await new Promise((r) => setTimeout(r, CHANNEL_POLL_INTERVAL));
    data = await getOtherSideDeviceInfo();
  }
  return data;
};

let channelIntervalId: IntervalId;
let checkInProgress = false;

export const pollImportChannel = () => async (dispatch: dispatch) => {
  clearInterval(channelIntervalId);

  channelIntervalId = setInterval(() => {
    if (!checkInProgress) {
      checkInProgress = true;
      dispatch(checkImportChannel())
        .then(() => {
          checkInProgress = false;
        })
        .catch((err) => {
          checkInProgress = false;
          console.error(`error polling sync/import channel: ${err.message}`);
        });
    }
  }, CHANNEL_POLL_INTERVAL);

  console.log(`start polling sync/import channel (${channelIntervalId})`);
};

export const clearImportChannel = () => {
  console.log(`stop polling sync/import channel (${channelIntervalId})`);
  clearInterval(channelIntervalId);
};

export const checkImportChannel =
  () => async (dispatch: dispatch, getState: getState) => {
    const {
      recoveryData: {
        channel: { channelId, url },
      },
      settings: { isPrimaryDevice },
    } = getState();
    const channelApi = new ChannelAPI(url.href);
    const dataIds = await channelApi.list(channelId);
    await dispatch(downloadUserInfo({ channelApi, dataIds }));
    await dispatch(downloadConnections({ channelApi, dataIds }));
    await dispatch(downloadGroups({ channelApi, dataIds }));
    await dispatch(downloadContextInfo({ channelApi, dataIds }));
    if (!isPrimaryDevice) {
      await dispatch(downloadBlindSigs({ channelApi, dataIds }));
    }
    await dispatch(checkCompletedFlags({ channelApi, dataIds }));
  };
