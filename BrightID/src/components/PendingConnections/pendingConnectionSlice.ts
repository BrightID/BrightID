import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  createSelector,
  PayloadAction,
} from '@reduxjs/toolkit';
import i18next from 'i18next';
import { Alert } from 'react-native';
import {
  removeChannel,
  selectChannelById,
} from '@/components/PendingConnections/channelSlice';
import { selectConnectionById } from '@/reducer/connectionsSlice';
import { decryptData } from '@/utils/cryptoHelper';
import { PROFILE_VERSION } from '@/utils/constants';
import { createDeepEqualStringArraySelector } from '@/utils/createDeepEqualStringArraySelector';
import BrightidError, { USER_NOT_FOUND } from '@/api/brightidError';
import { NodeApi } from '@/api/brightId';

const pendingConnectionsAdapter = createEntityAdapter<PendingConnection>({
  selectId: (pendingConnection) => pendingConnection.profileId,
});

/*
  PendingConnection slice contains all pending connections and their profile info

  What is a pendingConnection:
   - 'id': unique id of this pending connection. Is also profileId on the profile server.
   - 'channelId': channel this pendingConnection is associated with
   - 'state': state of this pending connection (valid states TBD)
   - 'brightId': the brightId if the connection
   - 'name'
   - 'photo' (base64-encoded)
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
  PendingConnectionData,
  { channelId: string; profileId: string; api: NodeApi },
  { state: RootState }
>(
  'pendingConnections/newPendingConnection',
  async ({ channelId, profileId, api }, { getState }) => {
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

    const sharedProfile = decryptData(
      profileData,
      channel.aesKey,
    ) as SharedProfile;

    // compare profile version
    if (
      sharedProfile.version === undefined || // very old client version
      sharedProfile.version < PROFILE_VERSION // old client version
    ) {
      // other user needs to update his client
      const msg = i18next.t('pendingConnection.alert.text.otherOutdated', {
        name: `${sharedProfile.name}`,
      });
      Alert.alert(
        i18next.t('pendingConnection.alert.title.connectionImpossible'),
        msg,
      );
      throw new Error(msg);
    } else if (sharedProfile.version > PROFILE_VERSION) {
      // I need to update my client
      const msg = i18next.t('pendingConnection.alert.text.localOutdated', {
        name: `${sharedProfile.name}`,
      });
      Alert.alert(
        i18next.t('pendingConnection.alert.title.connectionImpossible'),
        msg,
      );
      throw new Error(msg);
    }
    // Is this brightID already in the list of unconfirmed pending connections? Can happen if the same user joins a
    // channel multiple times (e.g. if users app crashed)
    const alreadyPending = selectAllUnconfirmedConnections(getState()).find(
      (pc) => sharedProfile.id === pc.pendingConnectionData.sharedProfile.id,
    );
    if (alreadyPending) {
      throw new Error(
        `PendingConnection ${profileId}: BrightId ${sharedProfile.id} is already existing.`,
      );
    }

    // Is this a known connection reconnecting?
    const existingConnection = selectConnectionById(
      getState(),
      sharedProfile.id,
    );
    if (existingConnection) {
      console.log(`${sharedProfile.id} exists.`);
    }

    let profileInfo: ProfileInfo;
    try {
      profileInfo = await api.getProfile(sharedProfile.id);
    } catch (err) {
      if (err instanceof BrightidError && err.errorNum === USER_NOT_FOUND) {
        // this must be a new user not yet existing on backend.
        if (existingConnection) {
          // handle edge case:
          // The other user is not known in the backend, but already connected with us. This should never happen :/
          // Since profileInfo is required for reconnecting we can not start the reconnect flow.
          throw new Error(
            `PendingConnection ${profileId}: User already connected, but unknown in node api.`,
          );
        }
      } else {
        throw err;
      }
    }

    const pendingConnectionData: PendingConnectionData = {
      sharedProfile,
      profileInfo,
      existingConnection,
      myself: sharedProfile.id === getState().user.id,
    };
    return pendingConnectionData;
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
    confirmPendingConnection(state, action: PayloadAction<string>) {
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
          profileId: action.meta.arg.profileId,
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
      .addCase(newPendingConnection.fulfilled, (state, { meta, payload }) => {
        // thunk arguments are available via action.meta.arg:
        const { profileId } = meta.arg;

        // data returned by thunk is available via action.payload:
        const changes: Partial<PendingConnection> = {
          state: payload.myself
            ? pendingConnection_states.MYSELF
            : pendingConnection_states.UNCONFIRMED,
          pendingConnectionData: payload,
        };

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
  (state: RootState) => state.pendingConnections,
);

export const selectAllUnconfirmedConnections = createSelector(
  selectAllPendingConnections,
  (pendingConnections) =>
    pendingConnections.filter(
      (pc) => pc.state === pendingConnection_states.UNCONFIRMED,
    ),
);

export const selectPendingConnectionByBrightId = createSelector(
  selectAllPendingConnections,
  (_, brightId: string) => brightId,
  (pendingConnections, brightId) => {
    return pendingConnections.find((pc) => brightId === pc.brightId);
  },
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
export const selectAllPendingConnectionsByChannelIds =
  createDeepEqualStringArraySelector(
    selectAllPendingConnections,
    (_, channelIds: string[]) => channelIds,
    (pendingConnections, channelIds) => {
      console.log(`selectAllPendingConnectionsByChannelIds ${channelIds}...`);
      return pendingConnections.filter((pc) =>
        channelIds.includes(pc.channelId),
      );
    },
  );
export const selectAllUnconfirmedConnectionsByChannelIds =
  createDeepEqualStringArraySelector(
    selectAllUnconfirmedConnections,
    (_, channelIds: string[]) => channelIds,
    (pendingConnections, channelIds) => {
      console.log(
        `selectAllUnconfirmedConnectionsByChannelIds ${channelIds}...`,
      );
      return pendingConnections.filter((pc) =>
        channelIds.includes(pc.channelId),
      );
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
