// @flow
import {
  addChannel,
  selectChannelById,
  removeChannel,
  setMyChannel,
  updateChannel,
  selectAllChannelIds,
} from '@/components/NewConnectionsScreens/channelSlice';
import { retrieveImage } from '@/utils/filesystem';
import { encryptData } from '@/utils/cryptoHelper';
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
  updatePendingConnection,
  selectPendingConnectionById,
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
    dispatch(
      setMyChannel({ channelId: channel.id, channelType: channel.type }),
    );
    // upload my profile
    await dispatch(encryptAndUploadProfileToChannel(channel.id));
    // start polling for incoming connection requests
    dispatch(subscribeToConnectionRequests(channel.id));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

export const joinChannel = (channel: Channel) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  console.log(`Joining channel ${channel.id} at ${channel.ipAddress}`);
  // check to see if channel exists
  const channelIds = selectAllChannelIds(getState());
  if (channelIds.includes(channel.id)) {
    throw new Error('Channel already exists');
  }
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
    channel.ttl = CHANNEL_TTL;
  }

  // Start timer to expire channel
  channel.timeoutId = setTimeout(() => {
    console.log(`timer expired for channel ${channel.id}`);
    dispatch(leaveChannel(channel.id));
  }, ttl);

  // add channel to store
  // we need channel to exist prior to uploadingProfileToChannel
  await dispatch(addChannel(channel));

  // upload my profile to channel
  await dispatch(encryptAndUploadProfileToChannel(channel.id));
  // start polling for incoming connection requests
  dispatch(subscribeToConnectionRequests(channel.id));
};

export const leaveChannel = (channelId: string) => (
  dispatch: dispatch,
  getState: getState,
) => {
  const channel: Channel = selectChannelById(getState(), channelId);
  if (channel) {
    clearTimeout(channel.timeoutId);
    dispatch(unsubscribeFromConnectionRequests(channelId));
    dispatch(removeChannel(channelId));
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
    console.log(
      `Stopping previous timer ${(pollTimerId: any)} for channel ${channelId}`,
    );
    clearInterval(pollTimerId);
  }

  pollTimerId = setInterval(() => {
    // fetch all profileIDs in channel
    dispatch(fetchChannelProfiles(channelId));
    // fetch connection requests
    dispatch(fetchConnectionRequests(channelId));
  }, PROFILE_POLL_INTERVAL);

  console.log(`Start polling channel ${channelId}, pollTImerId ${pollTimerId}`);

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
    // console.log(`fetching profiles from channel ${channelId}`);
    const profileIds = await channel.api.list(channelId);
    const knownProfileIds = selectAllPendingConnectionIds(getState());
    profileIds.forEach((profileId) => {
      if (
        profileId !== channel.myProfileId &&
        !knownProfileIds.includes(profileId)
      ) {
        dispatch(
          newPendingConnection({
            channelId,
            profileId,
          }),
        );
      }
      if (profileIds.length > knownProfileIds.length + 1) {
        console.log(`Got ${profileIds.length} profileIds:`);
        console.dir(profileIds);
      }
    });
  },
);

export const fetchConnectionRequests = (channelId: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const channel: Channel = selectChannelById(getState(), channelId);
  const { myProfileId } = channel;
  const profileIds = await channel.api.list(myProfileId);
  for (const profileId of profileIds) {
    // check if signedMessage and profile exists
    const pendingConnection = selectPendingConnectionById(
      getState(),
      profileId,
    );
    if (pendingConnection && !pendingConnection.signedMessage) {
      console.log(`Got new connection request from profileId ${profileId}.`);
      // download connectionrequest to get signedMessage
      const profile = await channel.api.download({
        channelId: myProfileId,
        dataId: profileId,
      });
      const { signedMessage, connectionTimestamp } = profile;
      if (signedMessage) {
        // update existing pendingConnection with signedMessage and timestamp
        console.log('updating Pending Connection with signed message');
        dispatch(
          updatePendingConnection({
            id: profileId,
            changes: {
              signedMessage,
              timestamp: connectionTimestamp,
            },
          }),
        );
      } else {
        console.dir(profile);
        throw new Error(`Response does not include signedMessage.`);
      }
    }
  }
};

// TODO: This should not be a thunk, as no actions are dispatched.
//  Should be changed to regular function in utils, with channel and user data passed in
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
    const profileTimestamp = Date.now();

    const dataObj = {
      id,
      photo,
      name,
      score,
      profileTimestamp,
    };

    console.log(`Encrypting profile data with key ${channel.aesKey}`);
    let encrypted = encryptData(dataObj, channel.aesKey);
    console.log(`Posting profile data...`);
    await channel.api.upload({
      channelId,
      data: encrypted,
      dataId: channel.myProfileId,
    });
    dispatch(
      updateChannel({
        id: channelId,
        changes: {
          myProfileTimestamp: profileTimestamp,
        },
      }),
    );
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
