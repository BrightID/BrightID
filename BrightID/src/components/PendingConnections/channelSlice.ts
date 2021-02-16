import {
  createSelector,
  createSlice,
  createEntityAdapter,
} from '@reduxjs/toolkit';

/*

  What is a channel:
  - 'aesKey': encryption key for data transported through channel
  - 'api': instance of ChannelAPI for this channel
  - 'id': unique identifier
  - 'initiatorProfileId': profileId of channel initiator
  - 'myProfileId': my profileId in this channel
  - 'pollTimerId: IntervalId of timer polling for incoming connection requests from this channel
  - 'state': state of channel - see channel_states below
  - 'timestamp': timestamp of channel creation time
  - 'ttl': time to live of channel (seconds)
  - 'type': group or 1:1 connection - see channel_types below
  - 'timeoutId: Id of timer to expire channel once ttl is reached
  - 'url': url of channel

  The app could hold multiple channels at the same time. E.g. if i scan multiple QRCodes
  in a larger group session.

 */

// type channel_types = typeof channel_types[ChannelType];
// export const channel_types = {
//   GROUP: 'GROUP',
//   SINGLE: 'SINGLE',
// } as const;

export enum channel_types {
  GROUP = 'GROUP',
  SINGLE = 'SINGLE',
}

// type channel_states = typeof channel_states[ChannelState];
// export const channel_states = {
//   OPEN: 'OPEN',
//   CLOSED: 'CLOSED',
//   BACKGROUND: 'BACKGROUND',
// } as const;

export enum channel_states {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  BACKGROUND = 'BACKGROUND',
}

export const channelsAdapter = createEntityAdapter<ChannelsState>();

// By default, `createEntityAdapter` gives you `{ ids: [], entities: {} }`.
// If you want to track 'loading' or other keys, you would initialize them here:
// `getInitialState({ loading: false, activeRequestId: null })`
const initialState = channelsAdapter.getInitialState({
  displayChannelType: channel_types.SINGLE,
  myChannelIds: {
    [channel_types.SINGLE]: '',
    [channel_types.GROUP]: '',
  },
});

const channelSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    addChannel: channelsAdapter.addOne,
    updateChannel: channelsAdapter.updateOne,
    closeChannel(state, action) {
      const { channelId, background } = action.payload;
      state = channelsAdapter.updateOne(state, {
        id: channelId,
        changes: {
          state: background ? channel_states.BACKGROUND : channel_states.CLOSED,
        },
      });
      if (state.myChannelIds[channel_types.SINGLE] === channelId)
        state.myChannelIds[channel_types.SINGLE] = '';

      if (state.myChannelIds[channel_types.GROUP] === channelId)
        state.myChannelIds[channel_types.GROUP] = '';
    },
    removeChannel(state, action) {
      const channelId = action.payload;
      state = channelsAdapter.removeOne(state, channelId);
      // In case my channel got removed also clear myChannelId
      if (state.myChannelIds[channel_types.SINGLE] === channelId)
        state.myChannelIds[channel_types.SINGLE] === '';

      if (state.myChannelIds[channel_types.GROUP] === channelId)
        state.myChannelIds[channel_types.GROUP] === '';
    },
    setMyChannel(state, action) {
      const { channelType, channelId } = action.payload;
      state.myChannelIds[channelType] = channelId;
    },
    setDisplayChannelType(state, action) {
      const channelType = action.payload;
      state.displayChannelType = channelType;
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
  setDisplayChannelType,
} = channelSlice.actions;

// Export channel selectors
export const {
  selectById: selectChannelById,
  selectAll: selectAllChannels,
  selectIds: selectAllChannelIds,
} = channelsAdapter.getSelectors((state: State) => state.channels);

// additional selectors
export const selectAllActiveChannelIds = createSelector(
  selectAllChannels,
  (_, type: ChannelType) => type,
  (channels, type) =>
    channels.filter((pc) => pc.type === type).map((pc) => pc.id),
);

export const selectAllActiveChannelIdsByType = createSelector(
  selectAllChannels,
  (_, type: ChannelType) => type,
  (channels, type) =>
    channels
      .filter(
        (pc) =>
          pc.type === type &&
          (pc.state === channel_states.OPEN ||
            pc.state === channel_states.BACKGROUND),
      )
      .map((pc) => pc.id),
);

// Export reducer
export default channelSlice.reducer;
