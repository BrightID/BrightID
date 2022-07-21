import { hash } from '@/utils/encoding';
import ChannelAPI from '@/api/channelService';
import { selectBaseUrl } from '@/reducer/settingsSlice';
import {
  downloadConnections,
  downloadGroups,
  downloadSigs,
  downloadNamePhoto,
} from './channelDownloadThunks';
import {
  selectRecoveryChannel,
  setChannelIntervalId,
  setRecoveryChannel,
} from '../recoveryDataSlice';
import { uploadRecoveryData } from '@/utils/recovery';

// CONSTANTS

export const CHANNEL_POLL_INTERVAL = 3000;

// THUNKS

export const createRecoveryChannel =
  (): AppThunk => async (dispatch: AppDispatch, getState) => {
    try {
      const { recoveryData } = getState();
      const baseUrl = selectBaseUrl(getState());
      const url = new URL(`${baseUrl}/profile`);
      // use this for local running profile service
      // const url = new URL(`http://10.0.2.2:3000/`);
      const channelApi = new ChannelAPI(url.href);
      const channelId = hash(recoveryData.aesKey);
      console.log(`created channel ${channelId} for recovery data`);
      dispatch(setRecoveryChannel({ channelId, url }));
      await uploadRecoveryData(recoveryData, channelApi);
      console.log(`Finished uploading recovery data to channel ${channelId}`);
    } catch (e) {
      const msg = 'Profile data already exists in channel';
      if (!e.message.startsWith(msg)) {
        throw e;
      }
    }
  };

let checkInProgress = false;

export const pollRecoveryChannel =
  (): AppThunk => async (dispatch: AppDispatch, getState) => {
    let { pollTimerId } = selectRecoveryChannel(getState());
    clearInterval(pollTimerId);

    pollTimerId = setInterval(() => {
      if (!checkInProgress) {
        checkInProgress = true;
        dispatch(checkRecoveryChannel())
          .then(() => {
            checkInProgress = false;
          })
          .catch((err) => {
            checkInProgress = false;
            console.error(`Error polling recovery channel: ${err.message}`);
          });
      }
    }, CHANNEL_POLL_INTERVAL);

    dispatch(setChannelIntervalId(pollTimerId));

    console.log(`start polling recovery channel (${pollTimerId}`);
  };

export const clearRecoveryChannel =
  (): AppThunk => async (dispatch: AppDispatch, getState) => {
    const { pollTimerId } = selectRecoveryChannel(getState());
    console.log(`stop polling recovery channel (${pollTimerId})`);
    clearInterval(pollTimerId);
    dispatch(setChannelIntervalId(null));
  };

export const checkRecoveryChannel =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const {
      recoveryData: {
        id: recoveryId,
        name,
        channel: { channelId, url },
      },
    } = getState();
    const channelApi = new ChannelAPI(url.href);
    const { entries: dataIds } = await channelApi.list(channelId);

    if (recoveryId) {
      // process connections uploaded to the channel
      await dispatch(downloadConnections({ channelApi, dataIds }));

      // process groups uploaded to the channel
      await dispatch(downloadGroups({ channelApi, dataIds }));

      if (!name) {
        await dispatch(downloadNamePhoto({ channelApi, dataIds }));
      }
    }

    // process signatures uploaded to the channel
    await dispatch(downloadSigs({ channelApi, dataIds }));
  };
