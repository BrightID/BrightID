// @flow
import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
import moment from 'moment';
import {
  removeChannel,
  selectChannelById,
} from '@/components/NewConnectionsScreens/channelSlice';
import { decryptData } from '@/utils/cryptoHelper';
import api from '@/api/brightId';

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
  MYSELF: 'MYSELF',
  EXPIRED: 'EXPIRED',
};

const fetchConnectionInfo = async ({ myConnections, brightId }) => {
  try {
    const {
      createdAt,
      groups,
      connections = [],
      flaggers,
    } = await api.getUserInfo(brightId);
    const mutualConnections = connections.filter(function (el) {
      return myConnections.some((x) => x.id === el.id);
    });
    return {
      connections: connections.length,
      groups: groups.length,
      mutualConnections: mutualConnections.length,
      connectionDate: `Created ${moment(parseInt(createdAt, 10)).fromNow()}`,
      flagged: flaggers && Object.keys(flaggers).length > 0,
    };
  } catch (err) {
    if (err instanceof Error && err.message === 'User not found') {
      return {
        connections: 0,
        groups: 0,
        mutualConnections: 0,
        connectionDate: 'New user',
        flagged: false,
      };
    } else {
      err instanceof Error ? console.warn(err.message) : console.log(err);
      return {};
    }
  }
};

export const newPendingConnection = createAsyncThunk(
  'pendingConnections/newPendingConnection',
  async ({ channelId, profileId }, { getState, dispatch }) => {
    console.log(`new pending connection ${profileId} in channel ${channelId}`);

    const channel = selectChannelById(getState(), channelId);

    if (!channel) {
      throw new Error('Channel does not exist');
    }

    // download profile
    const profileData = await channel.api.download({
      channelId,
      dataId: profileId,
    });
    const decryptedObj = decryptData(profileData, channel.aesKey);
    decryptedObj.myself = decryptedObj.id === getState().user.id;
    // I'm confused about this initiator logic, might change this...
    decryptedObj.initiator =
      decryptedObj.profileTimestamp > channel.myProfileTimestamp;

    if (profileData && profileData.data) {
      const decryptedObj = decryptData(profileData.data, channel.aesKey);
      decryptedObj.myself = decryptedObj.id === getState().user.id;
      // I'm confused about this initiator logic, might change this...
      decryptedObj.initiator =
        decryptedObj.profileTimestamp <= channel.myProfileTimestamp;

      console.log(
        'decryptedObj.profileTimestamp',
        decryptedObj.profileTimestamp,
      );

      console.log('channel.myProfileTimestamp', channel.myProfileTimestamp);

      const connectionInfo = await fetchConnectionInfo({
        brightID: decryptedObj.brightID,
        myConnections: getState().connections.connections,
      });
      return { ...connectionInfo, ...decryptedObj };
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
    removeAllPendingConnections: pendingConnectionsAdapter.removeAll,
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
          state: pendingConnection_states.ERROR,
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
        profileTimestamp,
        initiator,
        connections,
        groups,
        mutualConnections,
        connectionDate,
        flagged,
      } = action.payload;

      const changes = {
        state: action.payload.myself
          ? pendingConnection_states.MYSELF
          : pendingConnection_states.UNCONFIRMED,
        brightId,
        name,
        photo,
        score,
        profileTimestamp,
        initiator,
        connections,
        groups,
        mutualConnections,
        connectionDate,
        flagged,
      };

      // add secret key, signed message, timestamp if dev
      if (__DEV__) {
        const { secretKey, signedMessage, timestamp } = action.payload;
        changes.secretKey = secretKey;
        changes.signedMessage = signedMessage;
        changes.timestamp = timestamp;
      }

      // Perform the update in redux
      state = pendingConnectionsAdapter.updateOne(state, {
        id: profileId,
        changes,
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

// export selectors

export const {
  selectAll: selectAllPendingConnections,
  selectById: selectPendingConnectionById,
  selectIds: selectAllPendingConnectionIds,
} = pendingConnectionsAdapter.getSelectors((state) => state.pendingConnections);

export const selectAllUnconfirmedConnections = createSelector(
  selectAllPendingConnections,
  (pendingConnections) =>
    pendingConnections.filter(
      (pc) => pc.state === pendingConnection_states.UNCONFIRMED,
    ),
);

// uses channelId's to search for users
export const selectAllPendingConnectionsByChannelIds = createSelector(
  selectAllUnconfirmedConnections,
  (_, channelIds: string[]) => channelIds,
  (pendingConnections, channelIds) =>
    pendingConnections.filter((pc) => channelIds.includes(pc.channelId)),
);

// export actions

export const {
  addPendingConnection,
  updatePendingConnection,
  removePendingConnection,
  removeAllPendingConnections,
  setPollTimerId,
  confirmPendingConnection,
  rejectPendingConnection,
  addFakePendingConnection,
} = pendingConnectionsSlice.actions;

export default pendingConnectionsSlice.reducer;
