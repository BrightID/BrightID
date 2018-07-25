// @flow

import { combineReducers } from 'redux';
// reducer/web3.js

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
  PUBLICKEY2,
} from '../actions';

// immutable js optional, but works really well with redux

// import { fromJS } from "immutable";

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
  name: '',
  userAvatar: '',
  groupsCount: 0,
  searchParam: '',
  connections: [
    {
      publicKey: [],
      name: '',
      avatar: '',
      connectionDate: '',
      trustScore: '',
    },
  ],
  nearbyPeople: [],
  publicKey: '',
  secretKey: '',
  publicKey2: '',
};

export const mainReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_TRUST_SCORE:
      return {
        ...state,
        trustScore: action.trustScore,
      };
    case GROUPS_COUNT:
      return {
        ...state,
        groupsCount: action.count,
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
        name: action.nameornym,
        publicKey: action.publicKey,
        secretKey: action.secretKey,
      };
    case REMOVE_USER_DATA:
      return {
        ...state,
        userAvatar: '',
        name: '',
        publicKey: '',
        secretKey: '',
      };

    case REFRESH_NEARBY_PEOPLE:
      return {
        ...state,
        nearbyPeople: action.nearbyPeople,
      };
    case PUBLICKEY2:
      return {
        ...state,
        publicKey2: action.publicKey2,
      };
    default:
      return state;
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

const reducer = combineReducers({
  main: mainReducer,
});

export default reducer;
