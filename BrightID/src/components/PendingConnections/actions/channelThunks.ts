import nacl from 'tweetnacl';
import {
  addChannel,
  selectChannelById,
  removeChannel,
  setMyChannel,
  updateChannel,
  channel_types,
  selectAllChannels,
  upsertChannel,
} from '@/components/PendingConnections/channelSlice';
import { selectAllSocialMediaToShare } from '@/reducer/socialMediaSlice';
import { retrieveImage } from '@/utils/filesystem';
import { encryptData } from '@/utils/cryptoHelper';
import { generateChannelData, createChannelInfo } from '@/utils/channels';
import {
  CHANNEL_CONNECTION_LIMIT,
  MIN_CHANNEL_JOIN_TTL,
  PROFILE_POLL_INTERVAL,
  PROFILE_VERSION,
  CHANNEL_INFO_NAME,
} from '@/utils/constants';
import {
  newPendingConnection,
  selectAllPendingConnectionIds,
} from '@/components/PendingConnections/pendingConnectionSlice';
import { selectBaseUrl } from '@/reducer/settingsSlice';
import { strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import { getGlobalNodeApi } from '@/components/NodeApiGate';

export const createChannel =
  (channelType: ChannelType) =>
  async (dispatch: dispatch, getState: getState) => {
    let channel: Channel | null | undefined;
    try {
      const baseUrl = selectBaseUrl(getState());
      const url = new URL(`${baseUrl}/profile`);
      // use this for local running profile service
      // const url = new URL(`http://10.0.2.2:3000/`);
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
        requestedTtl: channel.ttl,
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

export const joinChannel =
  (channel: Channel) => async (dispatch: dispatch, getState: getState) => {
    console.log(`Joining channel ${channel.id} at ${channel.url.href}`);

    // check to see if channel exists
    const existingChannel = selectChannelById(getState(), channel.id);
    if (existingChannel && existingChannel.timeoutId) {
      console.log(`Channel ${channel.id} already joined`);
      return;
    }

    // calc remaining lifetime of channel
    const ttl_remain = channel.timestamp + channel.ttl - Date.now();

    try {
      // don't join channel if it is/is about to expired
      if (ttl_remain < MIN_CHANNEL_JOIN_TTL) {
        console.log(
          `Remaining ttl ${ttl_remain} of channel ${channel.id} too low. Aborting join.`,
        );
        throw new Error('Channel expired');
      }

      // don't join channel if it already has maximum allowed number of entries.
      // Note that this is a client-side limitation in order to keep the UI usable.
      const entries = await channel.api.list(channel.id);
      // channel.api.list() will include the channelInfo.json file.
      // Remove it from list as I don't want to download and interpret it as a profile.
      const channelInfoIndex = entries.indexOf(CHANNEL_INFO_NAME);
      if (channelInfoIndex > -1) {
        entries.splice(channelInfoIndex, 1);
      }
      if (entries.length >= CHANNEL_CONNECTION_LIMIT) {
        throw new Error(`Channel is full`);
      }

      // Start timer to expire channel
      channel.timeoutId = setTimeout(() => {
        console.log(`timer expired for channel ${channel.id}`);
        dispatch(leaveChannel(channel.id));
      }, ttl_remain);

      // add channel to store
      // we need channel to exist prior to uploadingProfileToChannel
      dispatch(upsertChannel(channel));

      // start polling for profiles
      dispatch(subscribeToConnectionRequests(channel.id));
    } catch (e) {
      // Something went wrong while trying to join channel.
      console.log(`Error joining channel ${channel.id}: ${e}`);
      dispatch(leaveChannel(channel.id));
      throw e;
    }
  };

export const leaveChannel =
  (channelId: string) => (dispatch: dispatch, getState: getState) => {
    const channel: Channel = selectChannelById(getState(), channelId);
    if (channel) {
      clearTimeout(channel.timeoutId);
      dispatch(unsubscribeFromConnectionRequests(channelId));
      dispatch(removeChannel(channelId));
    }
  };

export const leaveAllChannels =
  () => (dispatch: dispatch, getState: getState) => {
    const channels = selectAllChannels(getState());
    for (const channel of channels) {
      console.log(`Leaving channel ${channel.id}`);
      clearTimeout(channel.timeoutId);
      dispatch(unsubscribeFromConnectionRequests(channel.id));
      dispatch(removeChannel(channel.id));
    }
  };

export const subscribeToConnectionRequests =
  (channelId: string) => (dispatch: dispatch, getState: getState) => {
    let { pollTimerId } = selectChannelById(getState(), channelId);

    if (pollTimerId) {
      console.log(
        `Stopping previous timer ${
          pollTimerId as any
        } for channel ${channelId}`,
      );
      clearInterval(pollTimerId);
    }

    pollTimerId = setInterval(() => {
      // fetch all profileIDs in channel
      dispatch(fetchChannelProfiles(channelId));
    }, PROFILE_POLL_INTERVAL);

    console.log(
      `Start polling channel ${channelId}, pollTImerId ${pollTimerId}`,
    );

    dispatch(
      updateChannel({
        id: channelId,
        changes: {
          pollTimerId,
        },
      }),
    );
  };

export const unsubscribeFromConnectionRequests =
  (channelId: string) => (dispatch: dispatch, getState: getState) => {
    const { pollTimerId } = selectChannelById(getState(), channelId);

    if (pollTimerId) {
      console.log(`Stop polling channel ${channelId} (timer ${pollTimerId})`);
      clearInterval(pollTimerId);
      dispatch(
        updateChannel({
          id: channelId,
          changes: {
            pollTimerId: null,
          },
        }),
      );
    }
  };

export const fetchChannelProfiles =
  (channelId: string) => async (dispatch: Dispatch, getState: GetState) => {
    // don't try to fetch profiles if there is no node API available. Can happen if node goes down or
    // when rejoining hydrated channels at app startup
    if (!getGlobalNodeApi()) {
      console.log(`Skipping channel poll cycle - no NodeAPI available`);
      return;
    }

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

    /*
  Polling logic:
  type STAR:
   - Channel creator: Load all profiles
   - Other participant: Only load creator profile
  type GROUP:
   - everybody load all profiles
  type SINGLE:
   - Channel creator: Load participant profile
   - Other participant: Load creator profile
 */
    let stopPolling = false;
    switch (channel.type) {
      case channel_types.STAR:
        if (channel.initiatorProfileId === channel.myProfileId) {
          // Channel creator: Load all profiles
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
          // stop polling when channel limit is reached
          stopPolling = profileIds.length >= CHANNEL_CONNECTION_LIMIT;
        } else {
          // other participant: Only load initiator profile
          console.log(
            `STAR channel - Participant waiting for initiator profile`,
          );
          const foundInitiator = profileIds.includes(
            channel.initiatorProfileId,
          );
          if (
            foundInitiator &&
            !knownProfileIds.includes(channel.initiatorProfileId)
          ) {
            console.log(
              `STAR channel - Participant found initiator profileID ${channel.initiatorProfileId}`,
            );
            await dispatch(
              newPendingConnection({
                channelId,
                profileId: channel.initiatorProfileId,
              }),
            );
          }
          // stop polling when initiator profile is found
          stopPolling = foundInitiator;
        }
        break;
      case channel_types.GROUP:
        // Always load all profiles
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
        // stop polling only when channel limit is reached
        stopPolling = profileIds.length >= CHANNEL_CONNECTION_LIMIT;
        break;
      case channel_types.SINGLE:
        // there should be only 2 profiles in the channel. Just load all.
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
        // stop polling when 2 profiles are found (own profile and peer profile)
        stopPolling = profileIds.length >= 2;
        break;
    }

    if (stopPolling) {
      console.log(
        `Got expected profiles for channel ${channel.id}. Unsubscribing.`,
      );
      dispatch(unsubscribeFromConnectionRequests(channel.id));
    }
  };

export const encryptAndUploadProfileToChannel =
  (channelId: string) => async (dispatch: Dispatch, getState: GetState) => {
    // get channel
    const channel = selectChannelById(getState(), channelId);

    // prevent duplicate upload of my data. Could happen when rejoining hydrated channels after app restart.
    // Existence of myProfileTimestamp indicates that I already uploaded my profile.
    if (channel.myProfileTimestamp) {
      return;
    }

    // get user data
    const {
      id,
      photo: { filename },
      name,
    } = getState().user;

    const { notificationToken } = getState().notifications;

    const socialMedia = selectAllSocialMediaToShare(getState());

    // retrieve photo
    const photo = await retrieveImage(filename);
    const profileTimestamp = Date.now();

    const dataObj: SharedProfile = {
      id,
      photo,
      name,
      socialMedia,
      profileTimestamp,
      notificationToken,
      version: PROFILE_VERSION,
    };

    if (channel.initiatorProfileId === channel.myProfileId) {
      // create request proof that proves the user requested
      // the connection by creating the qr code
      const message = `${id}|${profileTimestamp}`;
      const { secretKey } = getState().keypair;
      dataObj.requestProof = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );
    }

    console.log(`Encrypting profile data with key ${channel.aesKey}`);
    const encrypted = encryptData(dataObj, channel.aesKey);
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
