// @flow
import {
  addChannel,
  channel_types,
  closeChannel,
  selectChannelById,
  setMyChannel,
  updateChannel,
} from '@/components/NewConnectionsScreens/channelSlice';
import { retrieveImage } from '@/utils/filesystem';
import { encryptData } from '@/utils/cryptoHelper';
import { postProfileToChannel } from '@/utils/profile';
import { generateChannelData } from '@/utils/channels';
import {
  CHANNEL_TTL,
  MIN_CHANNEL_JOIN_TTL,
  PROFILE_POLL_INTERVAL,
} from '@/utils/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  newPendingConnection,
  selectAllPendingConnectionIds,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';

export const createChannel = (channelType: ChannelType) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    // create new channel
    const channel: Channel = await generateChannelData(channelType);
    // Set timeout to expire channel
    channel.timeoutId = setTimeout(() => {
      console.log(`timer expired for channel ${channel.id}`);
      dispatch(leaveChannel(channel.id));
    }, channel.ttl);
    dispatch(addChannel(channel));
    dispatch(setMyChannel(channel.id));
    // upload my profile
    dispatch(encryptAndUploadProfileToChannel(channel.id));
    // start polling for incoming connection requests
    dispatch(subscribeToConnectionRequests(channel.id));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

export const joinChannel = (channel: Channel) => (dispatch: dispatch) => {
  // check ttl of channel
  const expirationTimestamp = channel.timestamp + channel.ttl;
  let ttl = expirationTimestamp - Date.now();
  if (ttl < MIN_CHANNEL_JOIN_TTL) {
    console.log(`Channel ${channel.id} ttl ${ttl} too low. Aborting join.`);
    return;
  }
  if (ttl > CHANNEL_TTL) {
    console.log(
      `WARNING - TTL ${ttl} of ${channel.id} is too high. Limiting to ${CHANNEL_TTL}.`,
    );
    ttl = CHANNEL_TTL;
  }

  // Start timer to expire channel
  channel.timeoutId = setTimeout(() => {
    console.log(`timer expired for channel ${channel.id}`);
    dispatch(leaveChannel(channel.id));
  }, ttl);

  // add channel to store
  dispatch(addChannel(channel));

  if (channel.type === channel_types.GROUP) {
    // TODO Decide: Require user confirmation before uploading profile to group channel?
    // upload my profile to channel
    dispatch(encryptAndUploadProfileToChannel(channel.id));
    // start polling for incoming connection requests
    dispatch(subscribeToConnectionRequests(channel.id));
  } else {
    // for 1:1 connections upload my profile without further confirmation
    dispatch(encryptAndUploadProfileToChannel(channel.id));
    // no polling for additional connection requests required
  }

  // fetch all profileIDs in channel
  dispatch(fetchChannelProfiles(channel.id));
};

export const leaveChannel = (channelId: string) => (
  dispatch: dispatch,
  getState: getState,
) => {
  const channel: Channel = selectChannelById(getState(), channelId);
  if (channel) {
    clearTimeout(channel.timeoutId);
    dispatch(unsubscribeFromConnectionRequests(channelId));
    dispatch(closeChannel(channelId));
  }
};

export const subscribeToConnectionRequests = (channelId: string) => (
  dispatch: dispatch,
  getState: getState,
) => {
  // this flow syntax is ugly. https://github.com/facebook/flow/issues/235
  let { pollTimerId }: { pollTimerId: IntervalID } = selectChannelById(
    getState(),
    channelId,
  );

  if (pollTimerId) {
    console.log(`Stopping previous timer ${(pollTimerId: any)}`);
    clearInterval(pollTimerId);
  }

  pollTimerId = setInterval(() => {
    dispatch(fetchConnectionRequests(channelId));
  }, PROFILE_POLL_INTERVAL);

  dispatch(
    updateChannel({
      id: channelId,
      changes: {
        pollTimerId,
      },
    }),
  );
};

export const unsubscribeFromConnectionRequests = (channelId: string) => (
  dispatch: dispatch,
  getState: getState,
) => {
  const { pollTimerId } = selectChannelById(getState(), channelId);

  if (pollTimerId) {
    console.log(`Stop polling channel ${channelId} (timer ${pollTimerId}`);
    clearInterval(pollTimerId);
    dispatch(
      updateChannel({
        id: channelId,
        changes: {
          pollTimerId: 0,
        },
      }),
    );
  }
};

export const fetchChannelProfiles = createAsyncThunk(
  'channels/fetchChannelProfiles',
  async (channelId, { getState, dispatch }) => {
    const channel = selectChannelById(getState(), channelId);
    const url = `http://${channel.ipAddress}/profile/list/${channelId}`;
    console.log(`fetching profiles from channel ${channelId} from ${url}`);
    const response = await fetch(url, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      throw new Error(
        `Channel list returned ${response.status}: ${response.statusText} for url: ${url}`,
      );
    }
    const responseObj = await response.json();
    if (responseObj && responseObj.profileIds) {
      const { profileIds } = responseObj;
      console.log(`Got ${profileIds.length} profileIds:`);
      console.dir(profileIds);
      profileIds.forEach((profileId) => {
        dispatch(
          newPendingConnection({
            channelId,
            profileId,
          }),
        );
      });
    } else {
      throw new Error(`Response does not include profileIds array.`);
    }
  },
);

export const fetchConnectionRequests = createAsyncThunk(
  'channels/fetchConnectionRequests',
  async (channelId, { getState, dispatch }) => {
    const channel: Channel = selectChannelById(getState(), channelId);
    const { myProfileId } = channel;
    const url = `http://${channel.ipAddress}/profile/list/${myProfileId}`;
    const response = await fetch(url, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      throw new Error(
        `profile server returned ${response.status}: ${response.statusText} for url: ${url}`,
      );
    }
    const responseObj = await response.json();
    if (responseObj && responseObj.profileIds) {
      const { profileIds } = responseObj;
      // remove known profileIds
      const knownProfileIds = selectAllPendingConnectionIds(getState());
      const newProfileIds = profileIds.filter(
        (id) => !knownProfileIds.includes(id),
      );
      for (const profileId of newProfileIds) {
        console.log(`Got new connection request from profileId ${profileId}.`);
        // download connectionrequest to get signedMessage
        const url = `http://${channel.ipAddress}/profile/download/${myProfileId}/${profileId}`;
        console.log(
          `fetching connectionRequest ${profileId} for my profile ${myProfileId} from ${url}`,
        );
        const response = await fetch(url, {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!response.ok) {
          throw new Error(
            `Profile server returned ${response.status}: ${response.statusText} for url: ${url}`,
          );
        }
        const responseJson = await response.json();
        const { signedMessage, connectionTimestamp } = responseJson.data;
        if (signedMessage) {
          // add new pendingConnection, including signedMessage and timestamp
          dispatch(
            newPendingConnection({
              channelId,
              profileId,
              signedMessage,
              timestamp: connectionTimestamp,
            }),
          );
        } else {
          console.dir(responseJson);
          throw new Error(`Response does not include signedMessage.`);
        }
      }
    }
  },
);

export const encryptAndUploadProfileToChannel = (channelId: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    // get channel
    const channel = selectChannelById(getState(), channelId);
    // get user data
    const {
      id,
      photo: { filename },
      name,
      score,
    } = getState().user;
    // retrieve photo
    const photo = await retrieveImage(filename);

    const dataObj = {
      id,
      photo,
      name,
      score,
    };

    console.log(`Encrypting profile data with key ${channel.aesKey}`);
    let encrypted = encryptData(dataObj, channel.aesKey);
    console.log(`Posting profile data...`);
    await postProfileToChannel(encrypted, channel);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
