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
import { selectAllSocialMedia } from '@/components/EditProfile/socialMediaSlice';
import { retrieveImage } from '@/utils/filesystem';
import { encryptData } from '@/utils/cryptoHelper';
import { generateChannelData, createChannelInfo } from '@/utils/channels';
import {
  CHANNEL_CONNECTION_LIMIT,
  CHANNEL_TTL,
  MIN_CHANNEL_JOIN_TTL,
  PROFILE_POLL_INTERVAL,
  PROFILE_VERSION,
  CHANNEL_INFO_NAME,
} from '@/utils/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  newPendingConnection,
  selectAllPendingConnectionIds,
} from '@/components/PendingConnectionsScreens/pendingConnectionSlice';

export const createChannel = (channelType: ChannelType) => async (
  dispatch: dispatch,
) => {
  let channel: ?Channel;
  try {
    const url = new URL(`${api.baseUrl}/profile`);
    channel = await generateChannelData(channelType, url);

    // Set timeout to expire channel
    channel.timeoutId = setTimeout(() => {
      console.log(`timer expired for channel ${channel.id}`);
      dispatch(leaveChannel(channel.id));
    }, channel.ttl);
    dispatch(addChannel(channel));
    dispatch(
      setMyChannel({ channelId: channel.id, channelType: channel.type }),
    );

    // upload channel info
    const channelInfo: ChannelInfo = createChannelInfo(channel);
    await channel.api.upload({
      channelId: channel.id,
      data: channelInfo,
      dataId: CHANNEL_INFO_NAME,
    });

    // upload my profile
    await dispatch(encryptAndUploadProfileToChannel(channel.id));
    // start polling for profiles
    dispatch(subscribeToConnectionRequests(channel.id));
  } catch (e) {
    // Something went wrong while creating channel.
    if (channel && channel.id) {
      dispatch(leaveChannel(channel.id));
    }
    console.log(`Error while creating channel: ${e}`);
    // need to throw to prevent app from looping
    throw e;
  }
};

export const joinChannel = (channel: Channel) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  console.log(`Joining channel ${channel.id} at ${channel.url.href}`);
  // check to see if channel exists
  const channelIds = selectAllChannelIds(getState());
  if (channelIds.includes(channel.id)) {
    console.log(`Channel ${channel.id} already joined`);
    return;
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
    // start polling for profiles
    dispatch(subscribeToConnectionRequests(channel.id));
  } catch (e) {
    // Something went wrong while trying to join channel.
    dispatch(leaveChannel(channel.id));
    throw e;
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

    // channel.api.list() will include the channelInfo.json file.
    // Remove it from list as I don't want to download and interpret it as a profile.
    const channelInfoIndex = profileIds.indexOf(CHANNEL_INFO_NAME);
    if (channelInfoIndex > -1) {
      profileIds.splice(channelInfoIndex, 1);
    }

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
  } = getState().user;

  const { notificationToken } = getState().notifications;

  let socialMedia = selectAllSocialMedia(getState());

  // retrieve photo
  const photo = await retrieveImage(filename);
  const profileTimestamp = Date.now();

  const dataObj = {
    id,
    photo,
    name,
    socialMedia,
    profileTimestamp,
    notificationToken,
    version: PROFILE_VERSION,
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
