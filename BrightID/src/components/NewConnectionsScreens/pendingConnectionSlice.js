// @flow
import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { decryptData } from '@/utils/cryptoHelper';
import {
  removeChannel,
  selectChannelById,
} from '@/components/NewConnectionsScreens/channelSlice';
import { obtainKeys } from '@/utils/keychain';
import { hash, strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import nacl from 'tweetnacl';
import api from '@/Api/BrightId';
import { postConnectionRequest } from '@/utils/profile';
import { addConnection, addOperation } from '@/actions';
import { saveImage } from '@/utils/filesystem';
import { backupPhoto, backupUser } from '@/components/Recovery/helpers';
import { TIME_FUDGE } from '@/utils/constants';

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
  async ({ channelId, profileId, signedMessage, timestamp }, { getState }) => {
    console.log(
      `new pending connection ${profileId} with signedMessage "${signedMessage}" in channel ${channelId}`,
    );
    // TODO: using the premade "selectChannelById" selector leads to circular reference error at import, so getting
    //  the channel manually for now
    //  const channel = selectChannelById(getState(), channelId);
    const channel = getState().channels.entities[channelId];
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

export const confirmPendingConnectionThunk = createAsyncThunk(
  'pendingConnections/confirmPendingConnectionThunk',
  async (id, { getState, dispatch }) => {
    const connection: PendingConnection = selectPendingConnectionById(
      getState(),
      id,
    );
    const channel = selectChannelById(getState(), connection.channelId);
    console.log(`confirming connection ${id} in channel ${channel.id}`);

    const {
      user: { backupCompleted },
    } = getState();

    // validate profile state
    if (connection.state !== pendingConnection_states.UNCONFIRMED) {
      console.log(`Can't confirm - Connection is in state ${connection.state}`);
      return;
    }

    let { username, secretKey } = await obtainKeys();
    let connectionTimestamp = Date.now();

    if (connection.signedMessage) {
      // I'm responding
      // The other user signed a connection request; we have enough info to
      // make an API call to create the connection.
      if (connection.timestamp > connectionTimestamp + TIME_FUDGE) {
        throw new Error("timestamp can't be in the future");
      }

      const message = `Add Connection${connection.brightId}${username}${connection.timestamp}`;
      const signedMessage = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );
      await api.createConnection(
        connection.brightId,
        connection.signedMessage,
        username,
        signedMessage,
        connection.timestamp,
      );
    } else {
      // I'm initiating
      const message = `Add Connection${username}${connection.brightId}${connectionTimestamp}`;
      const signedMessage = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );

      // bring signedmessage to peer so he knows i want to connect with him...
      console.log(
        `Uploading signed connection string for ${connection.name} to channel ${connection.id}`,
      );
      const data = {
        signedMessage,
        connectionTimestamp,
      };
      await postConnectionRequest(
        data,
        channel.ipAddress,
        connection.id,
        channel.myProfileId,
      );

      // Listen for add connection operation to be completed by other party
      let opName = 'Add Connection';
      let opMessage =
        opName + username + connection.brightId + connectionTimestamp;
      console.log(
        `Responder opMessage: ${opMessage} - hash: ${hash(opMessage)}`,
      );
      const op = {
        _key: hash(opMessage),
        name: opName,
        connectionTimestamp,
      };
      dispatch(addOperation(op));
    }

    // save connection photo
    const filename = await saveImage({
      imageName: connection.brightId,
      base64Image: connection.photo,
    });

    // transfer connection from pendingConnections to established connections
    const connectionData = {
      id: connection.brightId,
      name: connection.name,
      score: connection.score,
      // secretKey: connectUserData.secretKey,
      // aesKey: connectUserData.aesKey,
      connectionDate: connectionTimestamp,
      photo: { filename },
      status: 'initiated',
    };

    dispatch(addConnection(connectionData));
    dispatch(confirmPendingConnection(connection.id));

    if (backupCompleted) {
      await backupUser();
      await backupPhoto(connection.brightId, filename);
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
  addFakePendingConnection,
} = pendingConnectionsSlice.actions;

// export selectors
export const {
  selectAll: selectAllPendingConnections,
  selectById: selectPendingConnectionById,
  selectIds: selectAllPendingConnectionIds,
} = pendingConnectionsAdapter.getSelectors((state) => state.pendingConnections);

export default pendingConnectionsSlice.reducer;
