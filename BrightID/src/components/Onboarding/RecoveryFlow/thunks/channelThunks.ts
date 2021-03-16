import { hash } from '@/utils/encoding';
import api from '@/api/brightId';
import ChannelAPI from '@/api/channelService';
import {
  downloadConnections,
  downloadGroups,
  downloadSigs,
  downloadNamePhoto,
} from './channelDownloadThunks';
import { setupRecovery } from './recoveryThunks';
import { resetChannelExpiration, setChannel } from '../recoveryDataSlice';

// CONSTANTS

export const CHANNEL_POLL_INTERVAL = 3000;

// THUNKS

export const createChannel = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    const { recoveryData } = getState();

    const url = new URL(`${api.baseUrl}/profile`);
    // const url = new URL(`http://192.168.178.145:3000`);
    const channelApi = new ChannelAPI(url.href);
    const channelId = hash(recoveryData.aesKey);

    dispatch(setChannel({ channelId, url }));

    await uploadRecoveryData(recoveryData, channelApi);

    console.log(`creating channel for recovery data: ${channelId}`);
  } catch (e) {
    const msg = 'Profile data already exists in channel';
    if (!e.message.startsWith(msg)) {
      throw e;
    }
  }
};

const uploadRecoveryData = async (
  recoveryData: RecoveryData,
  channelApi: ChannelAPI,
) => {
  const channelId = hash(recoveryData.aesKey);
  const dataObj = {
    signingKey: recoveryData.publicKey,
    timestamp: recoveryData.timestamp,
  };
  const data = JSON.stringify(dataObj);
  console.log(`Uploading data: ${data}`);
  await channelApi.upload({
    channelId,
    data,
    dataId: 'data',
  });
};

let channelIntervalId: IntervalId;
let checkInProgress = false;

export const pollChannel = () => async (dispatch: dispatch) => {
  // creates publicKey, secretKey, aesKey for user
  await dispatch(setupRecovery());
  // create channel for recovery sigs
  await dispatch(createChannel());

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
          console.error(`polling channel: ${err.message}`);
        });
    }
  }, CHANNEL_POLL_INTERVAL);

  console.log('begin polling recovery sig channel', channelIntervalId);
};

export const clearChannel = () => {
  console.log(`clearing channel for ${channelIntervalId}`);
  clearInterval(channelIntervalId);
};

export const checkChannel = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const {
    recoveryData: {
      id: recoveryId,
      name,
      channel: { channelId, url, expires },
    },
  } = getState();
  const { recoveryData } = getState();
  const channelApi = new ChannelAPI(url.href);

  // keep channel alive by re-uploading my data
  const remainingTTL = expires - Date.now();
  console.log(`Recovery channel ttl is ${remainingTTL}ms`);
  if (remainingTTL < 30000) {
    await uploadRecoveryData(recoveryData, channelApi);
    dispatch(resetChannelExpiration());
  }
  /*
  if (expires && Date.now() - expires > 0) {
    // create new channel if date is expired
    console.log(`channel expired, creating new channel`);
    await dispatch(createChannel());
    return;
  }
   */

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
