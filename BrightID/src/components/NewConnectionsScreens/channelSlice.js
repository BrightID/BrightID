// @flow

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

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
export const {
  selectById: selectChannelById,
  selectAll: selectAllChannels,
} = channelsAdapter.getSelectors((state) => state.channels);

// Export reducer
export default channelSlice.reducer;
