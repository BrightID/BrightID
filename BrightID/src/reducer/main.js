// @flow

import {
  USER_TRUST_SCORE,
  GROUPS_COUNT,
  SEARCH_PARAM,
  UPDATE_CONNECTIONS,
  CONNECTIONS_SORT,
  ADD_CONNECTION,
  UPDATE_USER_DATA,
  REMOVE_USER_DATA,
  USER_AVATAR,
  REFRESH_NEARBY_PEOPLE,
  CONNECT_PUBLICKEY,
  CONNECT_NAMEORNYM,
  CONNECT_TIMESTAMP,
  CONNECT_TRUST_SCORE,
  CONNECT_AVATAR,
  CONNECT_RECIEVED_TIMESTAMP,
  CONNECT_RECIEVED_NAMEORNYM,
  CONNECT_RECIEVED_PUBLICKEY,
  CONNECT_RECIEVED_AVATAR,
  CONNECT_RECIEVED_TRUSTSCORE,
  SET_CONNECT_QR_DATA,
  REMOVE_CONNECT_QR_DATA,
  REMOVE_CONNECTION,
  ARBITER,
  RTC_ID,
  RESET_WEBRTC,
  BOX_KEYPAIR,
  SET_PREVIEW,
  RESET_PREVIEW,
  SET_CONNECT_USER_DATA,
  REMOVE_CONNECT_USER_DATA,
  SET_ENCRYPTED_USER_DATA,
  REMOVE_ENCRYPTED_USER_DATA,
} from '../actions';

const arbiterSchema = {
  USERA: {
    OFFER: '',
    ICE_CANDIDATE: '',
  },
  USERB: {
    ANSWER: '',
    ICE_CANDIDATE: '',
  },
};

/**
 * INITIAL STATE
 * structure the state of the app here
 *
 * @param trustScore String
 * @param name String
 * @param userAvatar Image
 * @param groupsCount Number
 * @param searchParam String
 * @param connections Array => Object
 */

export const initialState = {
  trustScore: '',
  nameornym: '',
  userAvatar: '',
  groupsCount: '',
  searchParam: '',
  connections: [],
  nearbyPeople: [],
  publicKey: '',
  secretKey: '',
  connectionsSort: '',
  connectQrData: { aesKey: '', ipAddress: {}, uuid: '', user: '' },
  connectUserData: { publicKey: '', avatar: '', nameornym: '', timestamp: '' },
  encryptedUserData: '',
};

export const mainReducer = (state = initialState, action) => {
  const connections = state.connections.slice();
  switch (action.type) {
    case USER_TRUST_SCORE:
      return {
        ...state,
        trustScore: action.trustScore,
      };
    case GROUPS_COUNT:
      return {
        ...state,
        groupsCount: action.groupsCount,
      };
    case USER_AVATAR:
      return {
        ...state,
        userAvatar: action.userAvatar,
      };
    case SEARCH_PARAM:
      return {
        ...state,
        searchParam: action.value,
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
      return {
        ...state,
        connections: [action.connection, ...connections],
      };
    case SET_ENCRYPTED_USER_DATA:
      return {
        ...state,
        encryptedUserData: action.encryptedData,
      };
    case REMOVE_ENCRYPTED_USER_DATA:
      return {
        ...state,
        encryptedUserData: '',
      };
    case REMOVE_CONNECTION:
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
        userAvatar: action.userAvatar,
        nameornym: action.nameornym,
        publicKey: action.publicKey,
        secretKey: action.secretKey,
      };
    case REMOVE_USER_DATA:
      return {
        ...state,
        userAvatar: '',
        nameornym: '',
        publicKey: '',
        secretKey: '',
      };

    case REFRESH_NEARBY_PEOPLE:
      return {
        ...state,
        nearbyPeople: action.nearbyPeople,
      };
    case CONNECT_PUBLICKEY:
      return {
        ...state,
        connectPublicKey: action.publicKey,
      };
    case SET_CONNECT_QR_DATA:
      return {
        ...state,
        connectQrData: action.connectQrData,
      };
    case REMOVE_CONNECT_QR_DATA:
      return {
        ...state,
        connectQrData: { aesKey: '', ipAddress: {}, uuid: '', user: '' },
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
        },
      };
    case CONNECT_NAMEORNYM:
      return {
        ...state,
        connectNameornym: action.nameornym,
      };
    case CONNECT_AVATAR:
      return {
        ...state,
        connectAvatar: action.avatar,
      };
    case CONNECT_TIMESTAMP:
      return {
        ...state,
        connectTimestamp: action.timestamp,
      };
    case CONNECT_TRUST_SCORE:
      return {
        ...state,
        connectTrustScore: action.trustScore,
      };
    case CONNECT_RECIEVED_NAMEORNYM:
      return {
        ...state,
        connectRecievedNameornym: true,
      };
    case CONNECT_RECIEVED_TRUSTSCORE:
      return {
        ...state,
        connectRecievedTrustScore: true,
      };
    case CONNECT_RECIEVED_PUBLICKEY:
      return {
        ...state,
        connectRecievedPublicKey: true,
      };
    case CONNECT_RECIEVED_TIMESTAMP:
      return {
        ...state,
        connectRecievedTimestamp: true,
      };
    case CONNECT_RECIEVED_AVATAR:
      return {
        ...state,
        connectRecievedAvatar: true,
      };
    case BOX_KEYPAIR:
      return {
        ...state,
        connectBoxKeypair: {
          ...state.connectBoxKeypair,
          publicKey: action.keypair.publicKey,
          secretKey: action.keypair.secretKey,
        },
      };
    case ARBITER:
      return {
        ...state,
        arbiter: action.arbiter,
      };
    case RTC_ID:
      return {
        ...state,
        rtcId: action.rtcId,
      };
    case RESET_WEBRTC:
      return {
        ...state,
        rtcId: '',
        arbiter: arbiterSchema,
        connectTimestamp: '',
        connectNameornym: '',
        connectTrustScore: '',
        connectAvatar: '',
        connectPublicKey: '',
        connectRecievedNameornym: false,
        connectRecievedPublicKey: false,
        connectRecievedTimestamp: false,
        connectRecievedTrustScore: false,
        connectRecievedAvatar: false,
        connectBoxKeypair: {
          ...state.connectBoxKeypair,
          publicKey: '',
          secretKey: '',
        },
      };
    case SET_PREVIEW:
      return {
        ...state,
        previewTimestamp: state.connectTimestamp,
        previewNameornym: state.connectNameornym,
        previewTrustScore: state.connectTrustScore,
        previewAvatar: state.connectAvatar,
        previewPublicKey: state.connectPublicKey,
      };
    case RESET_PREVIEW:
      return {
        ...state,
        previewTimestamp: '',
        previewNameornym: '',
        previewTrustScore: '',
        previewAvatar: '',
        previewPublicKey: '',
      };
    default:
      return state;
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default mainReducer;
