// @flow

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

/*

  What is a channel:
  - 'id': unique identifier
  - 'ipAddress': IP of profile service
  - 'aesKey': encryption key for data transported through channel
  - 'peerIds': Array of peerIds existing in channel
  - 'timestamp': timestamp of creation time
  - 'ttl': time to live of channel (seconds)
  - 'qrString': concatenated channel info, ready to be used for generating QRCode

  The app can hold multiple channels at the same time. E.g. if i scan multiple QRCodes
  in a larget group session, while also having created my own code.

  What is a peer:
  - 'id': unique brightID of user
  - 'profileId: Id of user's profile
  - 'timestamp'
  - 'signedMessage': First part of signed connection message, in case user initiated connection.
  - 'score'
  - secretKey:

  What is a profile:
  - 'id': unique profileId
  - 'name'
  - 'photo' (base64-encoded)
  - 'notificationToken': token that allows pushing notifications to user

 */

export const channelsAdapter = createEntityAdapter();
// By default, `createEntityAdapter` gives you `{ ids: [], entities: {} }`.
// If you want to track 'loading' or other keys, you would initialize them here:
// `getInitialState({ loading: false, activeRequestId: null })`
const initialState = channelsAdapter.getInitialState({
  myChannelId: '',
  myProfileId: '',
});

const channelSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    addChannel: channelsAdapter.addOne,
    removeChannel(state, action) {
      const channelId = action.payload;
      state = channelsAdapter.removeOne(state, channelId);
      // In case my channel got removed also clear myChannelId
      if (state.myChannelId === channelId) {
        state.myChannelId = initialState.myChannelId;
      }
    },
    createMyChannel(state, action) {
      const channel = action.payload;
      state = channelsAdapter.addOne(state, channel);
      state.myChannelId = channel.id;
    },
    clearMyChannel(state, action) {
      state = channelsAdapter.removeOne(state, state.myChannelId);
      state.myChannelId = initialState.myChannelId;
    },
    setMyProfileId(state, action) {
      state.myProfileId = action.payload;
    },
    clearMyProfileId(state) {
      state.myProfileId = initialState.myProfileId;
    },
  },
});

// Export channel actions
export const {
  addChannel,
  removeChannel,
  createMyChannel,
  clearMyChannel,
  setMyProfileId,
  clearMyProfileId,
} = channelSlice.actions;

// Export channel selectors
export const { selectById: selectChannelById } = channelsAdapter.getSelectors(
  (state) => state.channels,
);

// Export reducer
export default channelSlice.reducer;
