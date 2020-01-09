// @flow

import { Alert } from 'react-native';
import { dissoc, find, mergeRight, propEq } from 'ramda';
import {
  USER_SCORE,
  GROUPS_COUNT,
  SEARCH_PARAM,
  SET_NEW_GROUP_CO_FOUNDERS,
  CLEAR_NEW_GROUP_CO_FOUNDERS,
  SET_ELIGIBLE_GROUPS,
  DELETE_ELIGIBLE_GROUP,
  SET_CURRENT_GROUPS,
  JOIN_GROUP,
  JOIN_GROUP_AS_CO_FOUNDER,
  LEAVE_GROUP,
  SET_CONNECTIONS,
  CONNECTIONS_SORT,
  SET_USER_DATA,
  USER_PHOTO,
  SET_CONNECT_QR_DATA,
  REMOVE_CONNECT_QR_DATA,
  REMOVE_CONNECTION,
  SET_CONNECT_USER_DATA,
  REMOVE_CONNECT_USER_DATA,
  SET_VERIFICATIONS,
  ADD_APP,
  REMOVE_APP,
  SET_APPS,
  UPDATE_CONNECTION,
  ADD_CONNECTION,
  SET_NOTIFICATIONS,
  ADD_TRUSTED_CONNECTION,
  REMOVE_TRUSTED_CONNECTION,
  SET_BACKUP_COMPLETED,
  SET_PASSWORD,
  SET_RECOVERY_DATA,
  REMOVE_RECOVERY_DATA,
  SET_HASHED_ID,
  SET_USER_ID,
  REMOVE_SAFE_PUB_KEY,
  HYDRATE_STATE,
  RESET_STORE,
  UPDATE_CONNECTION_SCORES,
  SET_TRUSTED_CONNECTIONS,
} from '../actions';
import { verifyStore } from './verifyStoreV1';

/**
 * INITIAL STATE
 * structure the state of the app here
 *
 * @param score number
 * @param name String
 * @param photo Image
 * @param groupsCount Number
 * @param searchParam String
 * @param connections Array => Object
 */

// TODO: destructure every layer of this reducer
// check immutable functions

export const initialState: State = {
  score: __DEV__ ? 100 : 0,
  name: '',
  photo: { filename: '' },
  groupsCount: 0,
  searchParam: '',
  newGroupCoFounders: [],
  eligibleGroups: [],
  currentGroups: [],
  connections: [],
  verifications: [],
  apps: [],
  notifications: [],
  trustedConnections: [],
  backupCompleted: false,
  id: '',
  publicKey: '',
  password: '',
  hashedId: '',
  secretKey: new Uint8Array([]),
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

export const reducer = (state: State = initialState, action: action) => {
  switch (action.type) {
    case HYDRATE_STATE: {
      if (verifyStore(action.state)) {
        return action.state;
      } else {
        Alert.alert('Redux Store was not verified...');
        return state;
      }
    }
    case USER_SCORE: {
      return {
        ...state,
        score: action.score,
      };
    }
    case GROUPS_COUNT: {
      return {
        ...state,
        groupsCount: action.groupsCount,
      };
    }
    case USER_PHOTO: {
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
    case SET_ELIGIBLE_GROUPS: {
      return {
        ...state,
        eligibleGroups: action.eligibleGroups,
      };
    }
    case DELETE_ELIGIBLE_GROUP: {
      return {
        ...state,
        eligibleGroups: state.eligibleGroups.filter(
          (group) => group.id !== action.groupId,
        ),
      };
    }
    case SET_CURRENT_GROUPS: {
      return {
        ...state,
        currentGroups: action.currentGroups,
      };
    }
    case JOIN_GROUP: {
      action.group.isNew = false;
      action.group.knownMembers.push(state.id);
      return {
        ...state,
        currentGroups: [action.group, ...state.currentGroups],
        eligibleGroups: state.eligibleGroups.filter(
          (group) => group.id !== action.group.id,
        ),
      };
    }
    case JOIN_GROUP_AS_CO_FOUNDER: {
      // modify eligibleGroups[groupIndex].knownMembers, creating copies
      // at each of those three levels
      let newElGroups = state.eligibleGroups.slice();
      let groupIndex = newElGroups.findIndex((g) => g.id === action.groupId);
      let group = newElGroups[groupIndex];
      let newKnownMembers = [...group.knownMembers, state.id];
      newElGroups[groupIndex] = { ...group, knownMembers: newKnownMembers };
      return {
        ...state,
        eligibleGroups: newElGroups,
      };
    }
    case LEAVE_GROUP: {
      return {
        ...state,
        currentGroups: state.currentGroups.filter(
          (group) => group.id !== action.groupId,
        ),
      };
    }
    case SET_CONNECTIONS: {
      return {
        ...state,
        connections: action.connections.slice(0),
      };
    }
    case UPDATE_CONNECTION: {
      return {
        ...state,
        connections: [
          ...state.connections.slice(0, action.index),
          action.connection,
          ...state.connections.slice(action.index + 1),
        ],
      };
    }
    case UPDATE_CONNECTION_SCORES: {
      return {
        ...state,
        connections: state.connections.map<connection>((conn: connection) => {
          const updatedConn = find(propEq('id', conn.id))(action.connections);
          if (!updatedConn) {
            return conn;
          } else {
            return mergeRight(conn, updatedConn);
          }
        }),
      };
    }
    case ADD_CONNECTION: {
      return {
        ...state,
        connections: [...state.connections.slice(0), action.connection],
      };
    }
    case CONNECTIONS_SORT: {
      return {
        ...state,
        connectionsSort: action.connectionsSort,
      };
    }
    case REMOVE_CONNECTION: {
      let index = state.connections.findIndex(
        (val: connection) => val.publicKey === action.publicKey,
      );
      return {
        ...state,
        connections:
          index !== -1
            ? [
                ...state.connections.slice(0, index),
                ...state.connections.slice(index + 1),
              ]
            : state.connections,
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
      return {
        ...state,
        apps: [...state.apps, action.app],
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
    case SET_TRUSTED_CONNECTIONS: {
      return {
        ...state,
        trustedConnections: action.trustedConnections.slice(0),
      };
    }
    case SET_BACKUP_COMPLETED: {
      return {
        ...state,
        backupCompleted: action.backupCompleted,
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
