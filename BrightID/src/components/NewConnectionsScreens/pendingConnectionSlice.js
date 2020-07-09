import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { decryptData } from '@/utils/cryptoHelper';
import { removeChannel } from '@/components/NewConnectionsScreens/channelSlice';

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
  REJECTED: 'REJECTED',
  CONFIRMED: 'CONFIRMED',
  ERROR: 'ERROR',
};

export const newPendingConnection = createAsyncThunk(
  'pendingConnections/newPendingConnection',
  async (
    { channelId, profileId, signedMessage, timestamp },
    { getState, dispatch },
  ) => {
    console.log(
      `new pending connection ${profileId} with signedMessage "${signedMessage}" in channel ${channelId}`,
    );
    // TODO: using the premade "selectChannelById" selector leads to circular reference error at import, so getting
    //  the channel manually for now
    //  const channel = selectChannelById(getState(), channelId);
    const channel = getState().channels.entities[channelId];
    // download profile
    const Xurl = `http://${channel.ipAddress}/profile/download/${channelId}/${profileId}`;
    const url = `http://192.168.178.145:3000/download/${channelId}/${profileId}`;
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
const initialState = pendingConnectionsAdapter.getInitialState();

const pendingConnectionsSlice = createSlice({
  name: 'pendingConnections',
  initialState,
  reducers: {
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
        },
      });
    },
    [removeChannel]: (state, action) => {
      const channelId = action.payload;
      console.log(
        `TODO: remove pending connections associated to channel ${channelId}, abort/ignore any profile download operation.`,
      );
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
} = pendingConnectionsSlice.actions;

// channel selectors
export const {
  selectAll: selectAllPendingConnections,
  selectById: selectPendingConnectionById,
  selectIds: selectAllPendingConnectionIds,
} = pendingConnectionsAdapter.getSelectors((state) => state.pendingConnections);

export default pendingConnectionsSlice.reducer;
