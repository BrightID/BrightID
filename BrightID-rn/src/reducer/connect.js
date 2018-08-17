// @flow
/**
 * DONT USE THIS YET
 */

import {
  USER_TRUST_SCORE,
  GROUPS_COUNT,
  SEARCH_PARAM,
  UPDATE_CONNECTIONS,
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
  ARBITER,
  RTC_ID,
  RESET_WEBRTC,
} from '../actions';

const arbiterSchema = {
  ALPHA: {
    OFFER: '',
    ICE_CANDIDATE: '',
    PUBLIC_KEY: '',
  },
  ZETA: {
    ANSWER: '',
    ICE_CANDIDATE: '',
    PUBLIC_KEY: '',
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
  publicKey: '',
  secretKey: '',
  connectNameornym: '',
  connectPublicKey: '',
  connectTimestamp: '',
  connectTrustScore: '',
  connectAvatar: '',
  rtcId: '',
  arbiter: arbiterSchema,
};

export const connectReducer = (state = initialState, action) => {
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
    case ADD_CONNECTION:
      return {
        ...state,
        connections: [...state.connections, action.connection],
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
      };
    default:
      return state;
  }
};

export default connectReducer;
