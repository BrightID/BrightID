import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
import i18next from 'i18next';
import {
  removeChannel,
  selectChannelById,
} from '@/components/PendingConnections/channelSlice';
import { decryptData } from '@/utils/cryptoHelper';
import api from '@/api/brightId';
import { Alert } from 'react-native';
import { PROFILE_VERSION } from '@/utils/constants';
import { createDeepEqualStringArraySelector } from '@/utils/createDeepEqualStringArraySelector';
import BrightidError, { USER_NOT_FOUND } from '@/api/brightidError';

const pendingConnectionsAdapter = createEntityAdapter<PendingConnection>();

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
 */
export enum pendingConnection_states {
  INITIAL = 'INITIAL',
  DOWNLOADING = 'DOWNLOADING',
  UNCONFIRMED = 'UNCONFIRMED',
  CONFIRMING = 'CONFIRMING',
  CONFIRMED = 'CONFIRMED',
  ERROR = 'ERROR',
  MYSELF = 'MYSELF',
  EXPIRED = 'EXPIRED',
}

export const newPendingConnection = createAsyncThunk<
  PendingConnection,
  { channelId: string; profileId: string },
  {
    dispatch: Dispatch;
    state: State;
  }
>(
  'pendingConnections/newPendingConnection',
  async ({ channelId, profileId }, { getState }) => {
    console.log(`new pending connection ${profileId} in channel ${channelId}`);

    const channel = selectChannelById(getState(), channelId);

    if (!channel) {
      throw new Error('Channel does not exist');
    }

    // download profile
    const profileData: string = await channel.api.download({
      channelId,
      dataId: profileId,
    });

    const decryptedObj = decryptData(profileData, channel.aesKey);

    // compare profile version
    if (
      decryptedObj.version === undefined || // very old client version
      decryptedObj.version < PROFILE_VERSION // old client version
    ) {
      // other user needs to update his client
      const msg = i18next.t('pendingConnection.alert.text.otherOutdated', {
        name: `${decryptedObj.name}`,
      });
      Alert.alert(
        i18next.t('pendingConnection.alert.title.connectionImpossible'),
        msg,
      );
      throw new Error(msg);
    } else if (decryptedObj.version > PROFILE_VERSION) {
      // I need to update my client
      const msg = i18next.t('pendingConnection.alert.text.localOutdated', {
        name: `${decryptedObj.name}`,
      });
      Alert.alert(
        i18next.t('pendingConnection.alert.title.connectionImpossible'),
        msg,
      );
      throw new Error(msg);
    }

    decryptedObj.myself = decryptedObj.id === getState().user.id;
    let connectionInfo: PendingConnection = {};
    try {
      connectionInfo = await api.getUserProfile(decryptedObj.id);
    } catch (err) {
      if (err instanceof BrightidError && err.errorNum === USER_NOT_FOUND) {
        // this must be a new user not yet existing on backend. Return empty object.
        connectionInfo = {
          connectionsNum: 0,
          groupsNum: 0,
          mutualConnections: [],
          mutualGroups: [],
          createdAt: 0,
          connectedAt: 0,
          verifications: [],
          reports: [],
          existingConnection: undefined,
        };
      } else {
        throw err;
      }
    }
    // Is this a known connection?
    connectionInfo.existingConnection = getState().connections.connections.find(
      (conn) => conn.id === decryptedObj.id,
    );
    if (connectionInfo.existingConnection) {
      console.log(`${decryptedObj.id} exists.`);
    }
    return { ...connectionInfo, ...decryptedObj };
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(newPendingConnection.pending, (state, action) => {
        // This is called before actual thunk code is executed. Thunk argument is available via
        // action.meta.arg.

        // Add pending connection in DOWNLOADING state.
        state = pendingConnectionsAdapter.addOne(state, {
          id: action.meta.arg.profileId,
          channelId: action.meta.arg.channelId,
          state: pendingConnection_states.DOWNLOADING,
        });
      })
      .addCase(newPendingConnection.rejected, (state, action) => {
        // This is called if anything goes wrong
        console.log(`Error adding pending connection:`);
        console.log(action.error.message);

        state = pendingConnectionsAdapter.updateOne(state, {
          id: action.meta.arg.profileId,
          changes: {
            state: pendingConnection_states.ERROR,
          },
        });
      })
      .addCase(newPendingConnection.fulfilled, (state, action) => {
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
          connectionsNum,
          groupsNum,
          mutualConnections,
          mutualGroups,
          createdAt,
          connectedAt,
          reports,
          verifications,
          notificationToken,
          socialMedia,
          existingConnection,
        } = action.payload;

        const changes: PendingConnection = {
          state: action.payload.myself
            ? pendingConnection_states.MYSELF
            : pendingConnection_states.UNCONFIRMED,
          brightId,
          name,
          photo,
          score,
          profileTimestamp,
          initiator,
          connectionsNum,
          groupsNum,
          mutualConnections,
          mutualGroups,
          createdAt,
          connectedAt,
          reports,
          verifications,
          notificationToken,
          socialMedia,
          existingConnection,
        };

        // add secret key if dev
        if (__DEV__) {
          const { secretKey } = action.payload;
          changes.secretKey = secretKey;
        }

        // Perform the update in redux
        state = pendingConnectionsAdapter.updateOne(state, {
          id: profileId,
          changes,
        });
      })
      .addCase(removeChannel, (state, action) => {
        const channelId = action.payload;
        const deleteIds = state.ids.filter(
          (id) => state.entities[id].channelId === channelId,
        );
        console.log(
          `Channel ${channelId} deleted - removing ${deleteIds.length} pending connections associated to channel`,
        );
        state = pendingConnectionsAdapter.removeMany(state, deleteIds);
      });
  },
});

// export selectors

export const {
  selectAll: selectAllPendingConnections,
  selectById: selectPendingConnectionById,
  selectIds: selectAllPendingConnectionIds,
} = pendingConnectionsAdapter.getSelectors(
  (state: State) => state.pendingConnections,
);

export const selectAllUnconfirmedConnections = createSelector(
  selectAllPendingConnections,
  (pendingConnections) =>
    pendingConnections.filter(
      (pc) => pc.state === pendingConnection_states.UNCONFIRMED,
    ),
);

/*
  Using DeepEqualStringArraySelector here because there are different inputs:
  - selectAllPendingConnections/selectAllUnconfirmedConnections:
    Returns an array of objects directly from state. This is immutable, so we can use
    referential equality check.
  - channelIds:
    This array is created dynamically and will be a new object with each invocation. Therefore
    we have to use deep equality check
 */
export const selectAllPendingConnectionsByChannelIds = createDeepEqualStringArraySelector(
  selectAllPendingConnections,
  (_, channelIds: string[]) => channelIds,
  (pendingConnections, channelIds) => {
    console.log(`selectAllPendingConnectionsByChannelIds ${channelIds}...`);
    return pendingConnections.filter((pc) => channelIds.includes(pc.channelId));
  },
);
export const selectAllUnconfirmedConnectionsByChannelIds = createDeepEqualStringArraySelector(
  selectAllUnconfirmedConnections,
  (_, channelIds: string[]) => channelIds,
  (pendingConnections, channelIds) => {
    console.log(`selectAllUnconfirmedConnectionsByChannelIds ${channelIds}...`);
    return pendingConnections.filter((pc) => channelIds.includes(pc.channelId));
  },
);

// export actions

export const {
  updatePendingConnection,
  removePendingConnection,
  removeAllPendingConnections,
  confirmPendingConnection,
  addFakePendingConnection,
} = pendingConnectionsSlice.actions;

export default pendingConnectionsSlice.reducer;
