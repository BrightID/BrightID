// @flow

import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit';
import {
  newPendingConnection,
  selectAllPendingConnectionIds,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';
import { encryptAndUploadProfileToChannel } from '@/components/NewConnectionsScreens/actions/profile';
import { PROFILE_POLL_INTERVAL } from '@/utils/constants';
import { generateChannelData } from '@/utils/channels';

/*

  What is a channel:
  - 'id': unique identifier
  - 'initiatorProfileId': profileId of channel initiator
  - 'ipAddress': IP of profile service
  - 'aesKey': encryption key for data transported through channel
  - 'timestamp': timestamp of channel creation time
  - 'ttl': time to live of channel (seconds)
  - 'type': group or 1:1 connection - see CHANNEL_TYPES below
  - 'myProfileId': my profileId in this channel
  - 'pollTimerId: IntervalId of timer polling for incoming connection requests from this channel
  - 'timeoutId: Id of timer to expire channel once ttl is reached

  The app could hold multiple channels at the same time. E.g. if i scan multiple QRCodes
  in a larger group session.

 */

export const CHANNEL_TYPES = {
  CHANNEL_TYPE_GROUP: 0,
  CHANNEL_TYPE_ONE: 1,
};

export const subscribeToConnectionRequests = createAsyncThunk(
  'channels/subscribeToConnectionRequests',
  async (channelId, { getState, dispatch }) => {
    const channel: Channel = selectChannelById(getState(), channelId);

    let { pollTimerId } = channel;
    if (pollTimerId) {
      console.log(`Stopping previous timer ${pollTimerId}`);
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
  },
);

export const unsubscribeFromConnectionRequests = createAsyncThunk(
  'channels/unsubscribeFromConnectionRequests',
  (channelId, { getState, dispatch }) => {
    const channel: Channel = selectChannelById(getState(), channelId);
    let { pollTimerId } = channel;
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
  },
);

export const fetchConnectionRequests = createAsyncThunk(
  'channels/fetchConnectionRequests',
  async (channelId, { getState, dispatch }) => {
    const channel: Channel = selectChannelById(getState(), channelId);
    const { myProfileId } = channel;
    const Xurl = `http://${channel.ipAddress}/profile/list/${myProfileId}`;
    const url = `http://192.168.178.145:3000/list/${myProfileId}`;
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
        const Xurl = `http://${channel.ipAddress}/profile/download/${myProfileId}/${profileId}`;
        const url = `http://192.168.178.145:3000/download/${myProfileId}/${profileId}`;
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

export const createChannel = createAsyncThunk(
  'channels/createChannel',
  async (channelType: ChannelType, { getState, dispatch }) => {
    try {
      // create new channel
      const channel = await generateChannelData(channelType);
      // Set timeout to expire channel
      channel.timeoutId = setTimeout(() => {
        console.log(`timer expired for channel ${channel.id}`);
        dispatch(removeChannelThunk(channel.id));
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
  },
);

export const joinChannel = createAsyncThunk(
  'channels/joinChannel',
  async (channel: Channel, { getState, dispatch }) => {
    // Start timer to expire channel
    channel.timeoutId = setTimeout(() => {
      console.log(`timer expired for channel ${channel.id}`);
      dispatch(removeChannelThunk(channel.id));
    }, channel.ttl);
    // add channel to store
    dispatch(addChannel(channel));

    if (channel.type === CHANNEL_TYPES.CHANNEL_TYPE_GROUP) {
      // upload my profile to channel
      // TODO: Require user confirmation before uploading profile to channel!!!
      dispatch(encryptAndUploadProfileToChannel(channel.id));
      // start polling for incoming connection requests
      dispatch(subscribeToConnectionRequests(channel.id));
    }

    // fetch all profileIDs in channel
    dispatch(fetchChannelProfiles(channel.id));
  },
);

export const removeChannelThunk = createAsyncThunk(
  'channels/removeChannelThunk',
  async (channelId, { getState, dispatch }) => {
    const channel = selectChannelById(getState(), channelId);
    if (channel) {
      clearTimeout(channel.timeoutId);
      dispatch(unsubscribeFromConnectionRequests(channelId));
      dispatch(removeChannel(channelId));
    }
  },
);

export const fetchChannelProfiles = createAsyncThunk(
  'channels/fetchChannelProfiles',
  async (channelId, { getState, dispatch }) => {
    const channel = selectChannelById(getState(), channelId);
    const Xurl = `http://${channel.ipAddress}/profile/list/${channelId}`;
    const url = `http://192.168.178.145:3000/list/${channelId}`;
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

export const channelsAdapter = createEntityAdapter();

// By default, `createEntityAdapter` gives you `{ ids: [], entities: {} }`.
// If you want to track 'loading' or other keys, you would initialize them here:
// `getInitialState({ loading: false, activeRequestId: null })`
const initialState = channelsAdapter.getInitialState({
  myChannelId: '',
});

const channelSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    addChannel: channelsAdapter.addOne,
    updateChannel: channelsAdapter.updateOne,
    removeChannel(state, action) {
      const channelId = action.payload;
      state = channelsAdapter.removeOne(state, channelId);
      // In case my channel got removed also clear myChannelId
      if (state.myChannelId === channelId) {
        state.myChannelId = initialState.myChannelId;
      }
    },
    setMyChannel(state, action) {
      state.myChannelId = action.payload;
    },
  },
});

// Export channel actions
export const {
  addChannel,
  updateChannel,
  removeChannel,
  setMyChannel,
} = channelSlice.actions;

// Export channel selectors
export const { selectById: selectChannelById } = channelsAdapter.getSelectors(
  (state) => state.channels,
);

// Export reducer
export default channelSlice.reducer;
