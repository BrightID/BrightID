import { hash, urlSafeRandomKey } from '@/utils/encoding';
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
  (): AppThunk => async (dispatch: AppDispatch, getState) => {
    const { recoveryData } = getState();
    // setup recovery data
    if (!recoveryData.aesKey) {
      const aesKey = await urlSafeRandomKey(16);
      // setup recovery data slice with sync info
      dispatch(init({ aesKey }));
    }
  };

export const createSyncChannel =
  (): AppThunk => async (dispatch: AppDispatch, getState) => {
    const {
      recoveryData: { aesKey },
    } = getState();
    const baseUrl = selectBaseUrl(getState());
    const url = new URL(`${baseUrl}/profile`);
    // use this for local running profile service
    // const url = new URL(`http://10.0.2.2:3000/`);
    const channelId = hash(aesKey);
    console.log(`created channel ${channelId} for sync data`);
    dispatch(setRecoveryChannel({ channelId, url }));
    const { settings } = getState();
    let lastSyncTime = 0;
    if (!settings.isPrimaryDevice) {
      await dispatch(uploadDeviceInfo());
      console.log(
        `Finished uploading last sync time to the channel ${channelId}`,
      );
    } else {
      console.log(
        `Polling last sync time from the scanner of the channel ${channelId}`,
      );
      lastSyncTime = (await pollOtherSideDeviceInfo(url, channelId))
        .lastSyncTime;
      console.log(`Last sync time was ${lastSyncTime}`);
    }
    const after = settings.isPrimaryDevice
      ? lastSyncTime
      : settings.lastSyncTime;
    await dispatch(uploadAllInfoAfter(after));
    console.log(`Finished uploading sync data to the channel ${channelId}`);
  };

export const getOtherSideDeviceInfo = async (
  url: URL,
  channelId: string,
): Promise<SyncDeviceInfo> => {
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

export const pollOtherSideDeviceInfo = async (
  url: URL,
  channelId: string,
): Promise<SyncDeviceInfo> => {
  // TODO: This is an endless loop. Needs refactoring and error handling.
  let data = await getOtherSideDeviceInfo(url, channelId);
  while (data.lastSyncTime === undefined) {
    await new Promise((r) => setTimeout(r, CHANNEL_POLL_INTERVAL));
    data = await getOtherSideDeviceInfo(url, channelId);
  }
  return data;
};

let channelIntervalId: IntervalId;
let checkInProgress = false;

export const pollImportChannel =
  (): AppThunk => async (dispatch: AppDispatch) => {
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
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
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
    await dispatch(downloadBlindSigs({ channelApi, dataIds }));
    await dispatch(checkCompletedFlags({ channelApi, dataIds }));
  };
