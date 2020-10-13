// @flow
import {
  addChannel,
  selectChannelById,
  removeChannel,
  setMyChannel,
  updateChannel,
  selectAllChannelIds,
  channel_types,
} from '@/components/PendingConnectionsScreens/channelSlice';
import { retrieveImage } from '@/utils/filesystem';
import { encryptData } from '@/utils/cryptoHelper';
import { generateChannelData } from '@/utils/channels';
import {
  CHANNEL_CONNECTION_LIMIT,
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
} from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import { Alert } from 'react-native';
import { obtainKeys } from '@/utils/keychain';
import { respondToConnectionRequest } from '@/utils/connections';

export const createChannel = (channelType: ChannelType) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  let channel: Channel;
  try {
    // create new channel
    channel = await generateChannelData(channelType);
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
  } catch (e) {
    // Something went wrong while creating channel.
    if (channel && channel.id) {
      dispatch(leaveChannel(channel.id));
    }
    console.log(`Error while crating channel: ${e}`);
    Alert.alert(
      'Error',
      `Could not create connection channel. Error message: ${e.message}`,
    );
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

  // limit too high channel Time-To-Live
  if (channel.ttl > CHANNEL_TTL) {
    console.log(
      `WARNING - TTL ${channel.ttl} of ${channel.id} is too high. Limiting to ${CHANNEL_TTL}.`,
    );
    channel.ttl = CHANNEL_TTL;
  }

  // calc remaining lifetime of channel
  let ttl_remain = channel.timestamp + channel.ttl - Date.now();

  try {
    // don't join channel if it is/is about to expired
    if (ttl_remain < MIN_CHANNEL_JOIN_TTL) {
      console.log(
        `Remaining ttl ${ttl_remain} of channel ${channel.id} too low. Aborting join.`,
      );
      throw new Error('Channel expired');
    }

    // Start timer to expire channel
    channel.timeoutId = setTimeout(() => {
      console.log(`timer expired for channel ${channel.id}`);
      dispatch(leaveChannel(channel.id));
    }, ttl_remain);

    // add channel to store
    // we need channel to exist prior to uploadingProfileToChannel
    await dispatch(addChannel(channel));

    // upload my profile to channel
    await dispatch(encryptAndUploadProfileToChannel(channel.id));
    // start polling for incoming connection requests
    dispatch(subscribeToConnectionRequests(channel.id));
  } catch (e) {
    // Something went wrong while trying to join channel.
    dispatch(leaveChannel(channel.id));
    console.log(`Error while joining channel: ${e}`);
    Alert.alert(
      'Error',
      `Could not join connection channel. Error message: ${e.message}`,
    );
  }
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
    let profileIds = await channel.api.list(channelId);
    // Only get up to CHANNEL_CONNECTION_LIMIT profiles
    profileIds = profileIds.slice(0, CHANNEL_CONNECTION_LIMIT);
    const knownProfileIds = selectAllPendingConnectionIds(getState());
    if (__DEV__ && profileIds.length > knownProfileIds.length + 1) {
      console.log(`Got ${profileIds.length} profileIds:`, profileIds);
    }
    for (const profileId of profileIds) {
      if (
        profileId !== channel.myProfileId &&
        !knownProfileIds.includes(profileId)
      ) {
        await dispatch(
          newPendingConnection({
            channelId,
            profileId,
          }),
        );
      }
    }
  },
);

export const fetchConnectionRequests = (channelId: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const channel: Channel = selectChannelById(getState(), channelId);
  const { myProfileId } = channel;
  let profileIds = await channel.api.list(myProfileId);
  // Only get up to CHANNEL_CONNECTION_LIMIT profiles
  profileIds = profileIds.slice(0, CHANNEL_CONNECTION_LIMIT);
  for (const profileId of profileIds) {
    // check if signedMessage and profile exists
    const pendingConnection: PendingConnection = selectPendingConnectionById(
      getState(),
      profileId,
    );
    if (pendingConnection) {
      if (!pendingConnection.signedMessage) {
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
          if (pendingConnection.wantsToConfirm) {
            console.log(
              `Got initiators signed message for preconfirmed connection. Submitting operation now!`,
            );
            const { username, secretKey } = await obtainKeys();
            respondToConnectionRequest({
              otherBrightId: pendingConnection.brightId,
              signedMessage,
              timestamp: connectionTimestamp,
              myBrightId: username,
              secretKey,
            });
            if (channel.type === channel_types.SINGLE) {
              // Connection is established, so the 1:1 channel can be left
              dispatch(leaveChannel(channel.id));
            }
          }
        } else {
          console.dir(profile);
          throw new Error(`Response does not include signedMessage.`);
        }
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
  // get channel
  const channel = selectChannelById(getState(), channelId);
  // get user data
  const {
    id,
    photo: { filename },
    name,
    score,
  } = getState().user;

  const { notificationToken } = getState().notifications;
  // retrieve photo
  const photo = await retrieveImage(filename);
  const profileTimestamp = Date.now();

  const dataObj = {
    id,
    photo,
    name,
    score,
    profileTimestamp,
    notificationToken,
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
};
