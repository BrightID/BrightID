// @flow

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
  UPDATE_CONNECTIONS,
  CONNECTIONS_SORT,
  ADD_CONNECTION,
  UPDATE_USER_DATA,
  REMOVE_USER_DATA,
  USER_AVATAR,
  SET_CONNECT_QR_DATA,
  REMOVE_CONNECT_QR_DATA,
  REMOVE_CONNECTION,
  SET_CONNECT_USER_DATA,
  REMOVE_CONNECT_USER_DATA,
} from '../actions';
import { uInt8ArrayToUrlSafeB64 } from '../utils/encoding';

/**
 * INITIAL STATE
 * structure the state of the app here
 *
 * @param score number
 * @param name String
 * @param avatar Image
 * @param groupsCount Number
 * @param searchParam String
 * @param connections Array => Object
 */

export const initialState: Main = {
  score: 0,
  nameornym: '',
  avatar: '',
  groupsCount: 0,
  searchParam: '',
  newGroupCoFounders: [],
  eligibleGroups: [],
  currentGroups: [],
  connections: [],
  publicKey: null,
  safePubKey: '',
  secretKey: null,
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
    publicKey: null,
    avatar: '',
    nameornym: '',
    timestamp: '',
    signedMessage: '',
  },
};

export const mainReducer = (state: Main = initialState, action: {}) => {
  let connections, newElGroups, index;
  switch (action.type) {
    case USER_SCORE:
      return {
        ...state,
        score: action.score,
      };
    case GROUPS_COUNT:
      return {
        ...state,
        groupsCount: action.groupsCount,
      };
    case USER_AVATAR:
      return {
        ...state,
        avatar: action.avatar,
      };
    case SEARCH_PARAM:
      return {
        ...state,
        searchParam: action.value,
      };
    case SET_NEW_GROUP_CO_FOUNDERS: {
      return {
        ...state,
        newGroupCoFounders: [...action.coFounders],
      };
    }
    case CLEAR_NEW_GROUP_CO_FOUNDERS: {
      return {
        ...state,
        newGroupCoFounders: [],
      };
    }
    case SET_ELIGIBLE_GROUPS:
      return {
        ...state,
        eligibleGroups: action.eligibleGroups,
      };
    case DELETE_ELIGIBLE_GROUP:
      return {
        ...state,
        eligibleGroups: [...state.eligibleGroups].filter(
          group => group.id !== action.groupId,
        ),
      };
    case SET_CURRENT_GROUPS:
      return {
        ...state,
        currentGroups: action.currentGroups,
      };
    case JOIN_GROUP:
      action.group.isNew = false;
      action.group.knownMembers.push(state.safePubKey);
      return {
        ...state,
        currentGroups: [...state.currentGroups, action.group],
        eligibleGroups: [...state.eligibleGroups].filter(
          group => group.id !== action.group.id,
        )
      };
    case JOIN_GROUP_AS_CO_FOUNDER:
      newElGroups = state.eligibleGroups.slice();
      index = newElGroups.findIndex(g => g.id === action.groupId);
      newElGroups[index].knownMembers.push(state.safePubKey);
      return {
        ...state,
        eligibleGroups: newElGroups,
      };
    case UPDATE_CONNECTIONS:
      return {
        ...state,
        connections: action.connections,
      };
    case CONNECTIONS_SORT:
      return {
        ...state,
        connectionsSort: action.connectionsSort,
      };
    case ADD_CONNECTION:
      connections = state.connections.slice();
      return {
        ...state,
        connections: [action.connection, ...connections],
      };
    case REMOVE_CONNECTION:
      connections = state.connections.slice();
      return {
        ...state,
        connections: connections.filter(
          (val) =>
            JSON.stringify(val.publicKey) !== JSON.stringify(action.publicKey),
        ),
      };
    case UPDATE_USER_DATA:
      return {
        ...state,
        avatar: action.avatar,
        nameornym: action.nameornym,
        publicKey: action.publicKey,
        safePubKey: uInt8ArrayToUrlSafeB64(action.publicKey),
        secretKey: action.secretKey,
      };
    case REMOVE_USER_DATA:
      return {
        ...state,
        avatar: '',
        nameornym: '',
        publicKey: null,
        secretKey: null,
      };
    case SET_CONNECT_QR_DATA:
      // Compute the websocket channel and download (but not upload) path

      action.connectQrData.channel =
        action.connectQrData.uuid +
        (action.connectQrData.user === '1' ? '2' : '1');
      return {
        ...state,
        connectQrData: action.connectQrData,
      };
    case REMOVE_CONNECT_QR_DATA:
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
    case SET_CONNECT_USER_DATA:
      return {
        ...state,
        connectUserData: action.connectUserData,
      };
    case REMOVE_CONNECT_USER_DATA:
      return {
        ...state,
        connectUserData: {
          publicKey: '',
          avatar: '',
          nameornym: '',
          timestamp: '',
          signedMessage: '',
        },
      };
    default:
      return state;
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default mainReducer;
