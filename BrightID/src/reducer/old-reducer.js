// @flow

import { dissoc, find, mergeRight, propEq } from 'ramda';
import {
  SET_IS_SPONSORED,
  USER_SCORE,
  SEARCH_PARAM,
  CREATE_GROUP,
  SET_NEW_GROUP_CO_FOUNDERS,
  CLEAR_NEW_GROUP_CO_FOUNDERS,
  SET_GROUPS,
  SET_INVITES,
  DELETE_GROUP,
  ACCEPT_INVITE,
  REJECT_INVITE,
  JOIN_GROUP,
  LEAVE_GROUP,
  DISMISS_FROM_GROUP,
  SET_CONNECTIONS,
  CONNECTIONS_SORT,
  SET_USER_DATA,
  SET_USER_NAME,
  SET_USER_PHOTO,
  SET_CONNECT_QR_DATA,
  REMOVE_CONNECT_QR_DATA,
  DELETE_CONNECTION,
  SET_CONNECT_USER_DATA,
  REMOVE_CONNECT_USER_DATA,
  SET_VERIFICATIONS,
  ADD_APP,
  REMOVE_APP,
  SET_APPS,
  ADD_CONNECTION,
  SET_NOTIFICATIONS,
  ADD_TRUSTED_CONNECTION,
  REMOVE_TRUSTED_CONNECTION,
  SET_BACKUP_COMPLETED,
  SET_NONCE,
  SET_PASSWORD,
  SET_RECOVERY_DATA,
  REMOVE_RECOVERY_DATA,
  SET_HASHED_ID,
  SET_USER_ID,
  REMOVE_SAFE_PUB_KEY,
  HYDRATE_STATE,
  RESET_STORE,
  UPDATE_CONNECTIONS,
  ADD_OPERATION,
  REMOVE_OPERATION,
  RESET_OPERATIONS,
} from '@/actions';
import { INVITE_ACCEPTED, INVITE_REJECTED } from '@/utils/constants';

/**
 * INITIAL STATE
 * structure the state of the app here
 *
 */

// TODO: destructure every layer of this reducer
// check immutable functions

export const initialState: State = {
  score: __DEV__ ? 100 : 0,
  isSponsored: false,
  name: '',
  photo: { filename: '' },
  searchParam: '',
  newGroupCoFounders: [],
  groups: [],
  invites: [],
  connections: [],
  verifications: [],
  apps: [],
  notifications: [],
  trustedConnections: [],
  backupCompleted: false,
  id: '',
  publicKey: '',
  nonce: 0,
  password: '',
  hashedId: '',
  secretKey: new Uint8Array([]),
  operations: [],
  connectionsSort: '',
  connectQrData: {
    aesKey: '',
    ipAddress: '',
    uuid: '',
    user: '',
    qrString: '',
    channel: '',
  },
  connectUserData: {
    id: '',
    photo: '',
    name: '',
    timestamp: 0,
    signedMessage: '',
    score: 0,
  },
  recoveryData: {
    id: '',
    publicKey: '',
    secretKey: '',
    timestamp: 0,
    sigs: [],
  },
};

const byPrimaryGroup = (a, b) => {
  if (a.type === 'primary') {
    return -1;
  } else if (b.type === 'primary') {
    return 1;
  } else {
    return 0;
  }
};

const byIsNew = (a, b) => {
  if (a.isNew && b.isNew) {
    return 0;
  } else if (a.isNew) {
    return 1;
  } else if (b.isNew) {
    return -1;
  } else {
    return 0;
  }
};

export const reducer = (state: State = initialState, action: action) => {
  switch (action.type) {
    case HYDRATE_STATE: {
      return action.state;
    }
    case USER_SCORE: {
      return {
        ...state,
        score: action.score,
      };
    }
    case SET_IS_SPONSORED: {
      return {
        ...state,
        isSponsored: action.isSponsored,
      };
    }
    case SET_USER_PHOTO: {
      return {
        ...state,
        photo: action.photo,
      };
    }
    case SEARCH_PARAM: {
      return {
        ...state,
        searchParam: action.searchParam,
      };
    }
    case CREATE_GROUP: {
      return {
        ...state,
        groups: state.groups
          .concat(action.group)
          .sort(byPrimaryGroup)
          .sort(byIsNew),
      };
    }
    case DELETE_GROUP: {
      return {
        ...state,
        groups: state.groups.filter((group) => group.id !== action.group.id),
      };
    }
    case SET_NEW_GROUP_CO_FOUNDERS: {
      return {
        ...state,
        newGroupCoFounders: action.newGroupCoFounders,
      };
    }
    case CLEAR_NEW_GROUP_CO_FOUNDERS: {
      return {
        ...state,
        newGroupCoFounders: [],
      };
    }
    case SET_GROUPS: {
      const mergeWithOld = (group) => {
        const oldGroup = state.groups.find((g) => g.id === group.id);
        if (oldGroup) {
          group.name = oldGroup.name;
          group.photo = oldGroup.photo;
          group.aesKey = oldGroup.aesKey;
        }
        return group;
      };

      const groups = action.groups
        .map(mergeWithOld)
        .sort(byPrimaryGroup)
        .sort(byIsNew);
      return {
        ...state,
        groups,
      };
    }
    case SET_INVITES: {
      return {
        ...state,
        invites: action.invites,
      };
    }
    case ACCEPT_INVITE: {
      return {
        ...state,
        invites: state.invites.map((invite) => {
          if (invite.inviteId === action.inviteId) {
            invite.state = INVITE_ACCEPTED;
          }
          return invite;
        }),
      };
    }
    case REJECT_INVITE: {
      return {
        ...state,
        invites: state.invites.map((invite) => {
          if (invite.inviteId === action.inviteId) {
            invite.state = INVITE_REJECTED;
          }
          return invite;
        }),
      };
    }
    case JOIN_GROUP: {
      action.group.members.push(state.id);
      if (action.group.members.length === 3) {
        action.group.isNew = false;
      }
      return {
        ...state,
        groups: state.groups
          .concat(action.group)
          .sort(byPrimaryGroup)
          .sort(byIsNew),
      };
    }
    case LEAVE_GROUP: {
      return {
        ...state,
        groups: state.groups.filter((group) => group.id !== action.group.id),
      };
    }
    case DISMISS_FROM_GROUP: {
      const group = state.groups.find((group) => group.id === action.group.id);
      if (!group) return state;

      group.members = group.members.filter(
        (member) => member !== action.member,
      );
      return {
        ...state,
        groups: [...state.groups],
      };
    }
    case SET_CONNECTIONS: {
      return {
        ...state,
        connections: action.connections.slice(0),
      };
    }
    case UPDATE_CONNECTIONS: {
      return {
        ...state,
        connections: state.connections.map<connection>((conn: connection) => {
          const updatedConn = find(propEq('id', conn.id))(action.connections);
          if (!updatedConn) {
            if (conn.status === 'verified') conn.status = 'deleted';
            return conn;
          } else {
            if (conn.status === 'initiated' || !conn.status)
              conn.status = 'verified';
            return mergeRight(conn, updatedConn);
          }
        }),
      };
    }
    case ADD_CONNECTION: {
      if (!action.connection.id) return state;
      const removeExisting = ({ id }: connection) =>
        id !== action.connection.id;
      console.log('adding connection', action.connection.id);
      return {
        ...state,
        connections: [
          action.connection,
          ...state.connections.filter(removeExisting),
        ],
      };
    }
    case CONNECTIONS_SORT: {
      return {
        ...state,
        connectionsSort: action.connectionsSort,
      };
    }
    case DELETE_CONNECTION: {
      return {
        ...state,
        connections: state.connections.filter<connection>(
          (conn: connection) => conn.id !== action.id,
        ),
      };
    }
    case SET_USER_DATA: {
      return {
        ...state,
        photo: action.photo,
        name: action.name,
        publicKey: action.publicKey,
        id: action.id,
        secretKey: action.secretKey,
      };
    }
    case SET_USER_NAME: {
      return {
        ...state,
        name: action.name,
      };
    }
    case SET_CONNECT_QR_DATA: {
      // Compute the websocket channel and download (but not upload) path

      action.connectQrData.channel =
        action.connectQrData.uuid +
        (action.connectQrData.user === '1' ? '2' : '1');
      return {
        ...state,
        connectQrData: action.connectQrData,
      };
    }
    case REMOVE_CONNECT_QR_DATA: {
      return {
        ...state,
        connectQrData: {
          aesKey: '',
          ipAddress: '',
          uuid: '',
          user: '',
          qrString: '',
          channel: '',
        },
      };
    }
    case SET_CONNECT_USER_DATA: {
      return {
        ...state,
        connectUserData: action.connectUserData,
      };
    }
    case REMOVE_CONNECT_USER_DATA: {
      return {
        ...state,
        connectUserData: {
          id: '',
          photo: '',
          name: '',
          timestamp: 0,
          signedMessage: '',
          score: 0,
        },
      };
    }
    case SET_VERIFICATIONS: {
      return {
        ...state,
        verifications: action.verifications,
      };
    }
    case SET_APPS: {
      return {
        ...state,
        apps: action.apps,
      };
    }
    case ADD_APP: {
      const removeExisting = ({ name }: app) => name !== action.app.name;
      return {
        ...state,
        apps: [...state.apps.filter(removeExisting), action.app],
      };
    }
    case REMOVE_APP: {
      return {
        ...state,
        apps: state.apps.filter((app) => app.name !== action.name),
      };
    }
    case SET_NOTIFICATIONS: {
      return {
        ...state,
        notifications: action.notifications,
      };
    }
    case ADD_TRUSTED_CONNECTION: {
      return {
        ...state,
        trustedConnections: [...state.trustedConnections, action.id],
      };
    }
    case REMOVE_TRUSTED_CONNECTION: {
      return {
        ...state,
        trustedConnections: state.trustedConnections.filter(
          (id) => id !== action.id,
        ),
      };
    }
    case SET_BACKUP_COMPLETED: {
      return {
        ...state,
        backupCompleted: action.backupCompleted,
      };
    }
    case SET_NONCE: {
      return {
        ...state,
        nonce: action.nonce,
      };
    }
    case SET_PASSWORD: {
      return {
        ...state,
        password: action.password,
      };
    }
    case SET_RECOVERY_DATA: {
      return {
        ...state,
        recoveryData: action.recoveryData,
      };
    }
    case REMOVE_RECOVERY_DATA: {
      return {
        ...state,
        recoveryData: {
          publicKey: '',
          secretKey: '',
          id: '',
          timestamp: 0,
          sigs: [],
        },
      };
    }
    case SET_HASHED_ID: {
      return {
        ...state,
        hashedId: action.hash,
      };
    }
    case SET_USER_ID: {
      return {
        ...state,
        id: action.id,
      };
    }
    case REMOVE_SAFE_PUB_KEY: {
      return dissoc('safePubKey', state);
    }
    case ADD_OPERATION: {
      return {
        ...state,
        operations: state.operations.concat(action.op),
      };
    }
    case REMOVE_OPERATION: {
      return {
        ...state,
        operations: state.operations.filter((op) => op !== action.op),
      };
    }
    case RESET_OPERATIONS: {
      return { ...state, operations: [] };
    }
    case RESET_STORE: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default reducer;
