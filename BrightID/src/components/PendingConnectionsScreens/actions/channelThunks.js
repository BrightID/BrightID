// @flow
import api from '@/api/brightId';
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
} from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import {
  strToUint8Array,
  uInt8ArrayToB64
} from '@/utils/encoding';

import nacl from 'tweetnacl';
import { Alert } from 'react-native';

export const createChannel = (channelType: ChannelType) => async (
  dispatch: dispatch,
) => {
  let channel: Channel;
  try {
    // create new channel
    const ipAddress = await api.ip();
    channel = await generateChannelData(channelType, ipAddress);
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
    // start polling for profiles
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

    // start polling for profiles
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
    // can we stop polling?
    let expectedProfiles;
    switch (channel.type) {
      case channel_types.SINGLE:
        expectedProfiles = 2; // my profile and peer profile
        break;
      case channel_types.GROUP:
      default:
        expectedProfiles = CHANNEL_CONNECTION_LIMIT;
        break;
    }
    if (profileIds.length >= expectedProfiles) {
      console.log(
        `Got expected number of profiles (${expectedProfiles}) for channel ${channel.id}`,
      );
      dispatch(unsubscribeFromConnectionRequests(channel.id));
    }
  },
);

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

  if (channel.initiatorProfileId === channel.myProfileId) {
    // create request proof that proves the user requested
    // the connection by creating the qr code
    const message = `${id}|${profileTimestamp}`;
    const secretKey = getState().keypair.secretKey;
    dataObj.requestProof = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
  }

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
