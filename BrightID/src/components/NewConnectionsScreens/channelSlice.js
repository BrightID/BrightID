// @flow

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

/*

  What is a channel:
  - 'aesKey': encryption key for data transported through channel
  - 'id': unique identifier
  - 'initiatorProfileId': profileId of channel initiator
  - 'ipAddress': IP of profile service
  - 'myProfileId': my profileId in this channel
  - 'pollTimerId: IntervalId of timer polling for incoming connection requests from this channel
  - 'state': state of channel - see channel_states below
  - 'timestamp': timestamp of channel creation time
  - 'ttl': time to live of channel (seconds)
  - 'type': group or 1:1 connection - see channel_types below
  - 'timeoutId: Id of timer to expire channel once ttl is reached

  The app could hold multiple channels at the same time. E.g. if i scan multiple QRCodes
  in a larger group session.

 */

export const channel_types = {
  GROUP: 'GROUP',
  SINGLE: 'SINGLE',
};

export const channel_states = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
};

export const channelsAdapter = createEntityAdapter();

// By default, `createEntityAdapter` gives you `{ ids: [], entities: {} }`.
// If you want to track 'loading' or other keys, you would initialize them here:
// `getInitialState({ loading: false, activeRequestId: null })`
const initialState: ChannelsState = channelsAdapter.getInitialState({
  myChannelId: '',
});

const channelSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    addChannel: channelsAdapter.addOne,
    updateChannel: channelsAdapter.updateOne,
    closeChannel(state, action) {
      const channelId = action.payload;
      state = channelsAdapter.updateOne(state, {
        id: channelId,
        changes: {
          state: channel_states.CLOSED,
        },
      });
    },
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
  closeChannel,
} = channelSlice.actions;

// Export channel selectors
export const {
  selectById: selectChannelById,
  selectAll: selectAllChannels,
} = channelsAdapter.getSelectors((state) => state.channels);

// Export reducer
export default channelSlice.reducer;
