// @flow

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
import { setChannel } from '../recoveryDataSlice';

// CONSTANTS

export const CHANNEL_POLL_INTERVAL = 3000;

// THUNKS

export const createChannel = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    const { recoveryData } = getState();

    const data = {
      signingKey: recoveryData.publicKey,
      timestamp: recoveryData.timestamp,
    };

    const url = new URL(`${api.baseUrl}/profile`);

    const channelApi = new ChannelAPI(url.href);
    const channelId = hash(recoveryData.aesKey);

    dispatch(setChannel({ channelId, url }));

    await channelApi.upload({
      channelId,
      data,
      dataId: 'data',
    });

    console.log(`creating channel for recovery data: ${channelId}`);
  } catch (e) {
    const msg = 'Profile data already exists in channel';
    if (!e.message.startsWith(msg)) {
      throw e;
    }
  }
};

let channelIntervalId = 0;
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

  if (expires && Date.now() - expires > 0) {
    // create new channel if date is expired
    console.log(`channel expired, creating new channel`);
    await dispatch(createChannel());
    return;
  }

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
