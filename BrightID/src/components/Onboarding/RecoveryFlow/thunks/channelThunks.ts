import { hash } from '@/utils/encoding';
import ChannelAPI from '@/api/channelService';
import { selectBaseUrl } from '@/reducer/settingsSlice';
import {
  downloadConnections,
  downloadGroups,
  downloadSigs,
  downloadNamePhoto,
} from './channelDownloadThunks';
import { setRecoveryChannel } from '../recoveryDataSlice';
import { uploadRecoveryData } from '@/utils/recovery';

// CONSTANTS

export const CHANNEL_POLL_INTERVAL = 3000;

// THUNKS

export const createChannel =
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

let channelIntervalId: IntervalId;
let checkInProgress = false;

export const pollChannel = (): AppThunk => async (dispatch: AppDispatch) => {
  clearInterval(channelIntervalId);

  channelIntervalId = setInterval(() => {
    if (!checkInProgress) {
      checkInProgress = true;
      dispatch(checkChannel())
        .then(() => {
          checkInProgress = false;
        })
        .catch((err) => {
          checkInProgress = false;
          console.error(`Error polling recovery channel: ${err.message}`);
        });
    }
  }, CHANNEL_POLL_INTERVAL);

  console.log(`start polling recovery channel (${channelIntervalId}`);
};

export const clearChannel = () => {
  console.log(`stop polling recovery channel (${channelIntervalId})`);
  clearInterval(channelIntervalId);
};

export const checkChannel =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const {
      recoveryData: {
        id: recoveryId,
        name,
        channel: { channelId, url },
      },
    } = getState();
    const channelApi = new ChannelAPI(url.href);
    const dataIds = await channelApi.list(channelId);

    if (recoveryId) {
      // process connections uploaded to the channel
      // returns true if downloading connecion data this cycle
      await dispatch(downloadConnections({ channelApi, dataIds }));

      // process groups uploaded to the channel
      // returns true if downloading group data this cycle
      await dispatch(downloadGroups({ channelApi, dataIds }));

      if (!name) {
        await dispatch(downloadNamePhoto({ channelApi, dataIds }));
      }
    }

    // process signatures uploaded to the channel
    // returns true if downloading sigs this cycle
    await dispatch(downloadSigs({ channelApi, dataIds }));
  };
