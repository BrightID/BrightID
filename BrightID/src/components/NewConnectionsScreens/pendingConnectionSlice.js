// @flow
import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {
  removeChannel,
  selectChannelById,
} from '@/components/NewConnectionsScreens/channelSlice';
import { decryptData } from '@/utils/cryptoHelper';

const pendingConnectionsAdapter = createEntityAdapter();

/*
  PendingConnection slice contains all pending connections and their profile info

  What is a pendingConnection:
   - 'id': unique id of this pending connection. Is also profileId on the profile server.
   - 'channelId': channel this pendingConnection is associated with
   - 'state': state of this pending connection (valid states TBD)
   - 'brightId': the brightId if the connection
   - 'name'
   - 'photo' (base64-encoded)
   - 'score'
   - 'signedMessage': optional - First part of signed connection message, in case user initiated connection.
   - 'timestamp': optional - Timestamp when signed message was created
 */

export const pendingConnection_states = {
  INITIAL: 'INITIAL',
  DOWNLOADING: 'DOWNLOADING',
  UNCONFIRMED: 'UNCONFIRMED',
  CONFIRMING: 'CONFIRMING',
  REJECTED: 'REJECTED',
  CONFIRMED: 'CONFIRMED',
  ERROR: 'ERROR',
};

export const newPendingConnection = createAsyncThunk(
  'pendingConnections/newPendingConnection',
  async ({ channelId, profileId, signedMessage, timestamp }, { getState }) => {
    console.log(
      `new pending connection ${profileId} with signedMessage "${signedMessage}" in channel ${channelId}`,
    );

    const channel = selectChannelById(getState(), channelId);
    // download profile
    const url = `http://${channel.ipAddress}/profile/download/${channelId}/${profileId}`;
    console.log(
      `fetching profile ${profileId} for channel ${channelId} from ${url}`,
    );
    const response = await fetch(url, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      throw new Error(
        `Profile download returned ${response.status}: ${response.statusText} for url: ${url}`,
      );
    }
    const profileData = await response.json();

    if (profileData && profileData.data) {
      const decryptedObj = decryptData(profileData.data, channel.aesKey);
      decryptedObj.signedMessage = signedMessage;
      decryptedObj.timestamp = timestamp;
      return decryptedObj;
    } else {
      throw new Error(`Missing data in profile from url: ${url}`);
    }
  },
);

// By default, `createEntityAdapter` gives you `{ ids: [], entities: {} }`.
// If you want to track 'loading' or other keys, you would initialize them here:
// `getInitialState({ loading: false, activeRequestId: null })`
const initialState: PendingConnectionsState = pendingConnectionsAdapter.getInitialState();

const pendingConnectionsSlice = createSlice({
  name: 'pendingConnections',
  initialState,
  reducers: {
    addFakePendingConnection: pendingConnectionsAdapter.addOne,
    removePendingConnection: pendingConnectionsAdapter.removeOne,
    updatePendingConnection: pendingConnectionsAdapter.updateOne,
    confirmPendingConnection(state, action) {
      const id = action.payload;
      state = pendingConnectionsAdapter.updateOne(state, {
        id,
        changes: {
          state: pendingConnection_states.CONFIRMED,
        },
      });
    },
    rejectPendingConnection(state, action) {
      const id = action.payload;
      state = pendingConnectionsAdapter.updateOne(state, {
        id,
        changes: {
          state: pendingConnection_states.REJECTED,
        },
      });
    },
  },
  extraReducers: {
    [newPendingConnection.pending]: (state, action) => {
      // This is called before actual thunk code is executed. Thunk argument is available via
      // action.meta.arg.

      // Add pending connection in DOWNLOADING state.
      state = pendingConnectionsAdapter.addOne(state, {
        id: action.meta.arg.profileId,
        channelId: action.meta.arg.channelId,
        state: pendingConnection_states.DOWNLOADING,
      });
    },
    [newPendingConnection.rejected]: (state, action) => {
      // This is called if anything goes wrong
      console.log(`Error adding pending connection:`);
      console.log(action.error.message);

      state = pendingConnectionsAdapter.updateOne(state, {
        id: action.meta.arg.profileId,
        changes: {
          state: pendingConnection_states.INITIAL,
        },
      });
    },
    [newPendingConnection.fulfilled]: (state, action) => {
      // thunk argument is available via action.meta.arg:
      const { profileId } = action.meta.arg;

      // data returned by thunk is available via action.payload:
      const {
        id: brightId,
        name,
        photo,
        score,
        signedMessage,
        timestamp,
        profileTimestamp,
      } = action.payload;

      // Perform the update in redux
      state = pendingConnectionsAdapter.updateOne(state, {
        id: profileId,
        changes: {
          state: pendingConnection_states.UNCONFIRMED,
          brightId,
          name,
          photo,
          score,
          signedMessage,
          timestamp,
          profileTimestamp,
        },
      });
    },
    [removeChannel]: (state, action) => {
      const channelId = action.payload;
      const deleteIds = state.ids.filter(
        (id) => state.entities[id].channelId === channelId,
      );
      console.log(
        `Channel ${channelId} deleted - removing ${deleteIds.length} pending connections associated to channel`,
      );
      state = pendingConnectionsAdapter.removeMany(state, deleteIds);
    },
  },
});

export const {
  addPendingConnection,
  updatePendingConnection,
  removePendingConnection,
  setPollTimerId,
  confirmPendingConnection,
  rejectPendingConnection,
  addFakePendingConnection,
} = pendingConnectionsSlice.actions;

// export selectors
export const {
  selectAll: selectAllPendingConnections,
  selectById: selectPendingConnectionById,
  selectIds: selectAllPendingConnectionIds,
} = pendingConnectionsAdapter.getSelectors((state) => state.pendingConnections);

export default pendingConnectionsSlice.reducer;
