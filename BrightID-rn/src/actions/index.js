// @flow

export const TRUST_SCORE = 'TRUST_SCORE';
export const CONNECTIONS_COUNT = 'CONNECTIONS_COUNT';
export const GROUPS_COUNT = 'GROUPS_COUNT';
export const SEARCH_PARAM = 'SEARCH_PARAM';
export const ALL_CONNECTIONS = 'ALL_CONNECTIONS';
export const RON_PAUL = 'RON_PAUL';
export const SAVE_DATA_SUCCESS = 'SAVE_DATA_SUCCESS';
export const LOADING_USER = 'LOADING_USER';
export const USER_DATA = 'USER_DATA';
export const ERROR = 'ERROR';
export const REMOVE_USER_DATA = 'REMOVE_USER_DATA';
/**
 * Redux boilerplate, pass data through the app
 * Async actions / async functions can be implemented
 *
 * @param type derived from constants
 * @param payload data passed into the redux reducer
 *
 */

export const handleError = error => ({
  type: ERROR,
  error,
});

export const trustScore = payload => ({
  type: TRUST_SCORE,
  payload,
});

export const groupsCount = payload => ({
  type: GROUPS_COUNT,
  payload,
});

export const setSearchParam = value => ({
  type: SEARCH_PARAM,
  value,
});

export const allConnections = connections => ({
  type: ALL_CONNECTIONS,
  connections,
});

export const ronPaul = payload => ({
  type: RON_PAUL,
  payload,
});

export const loadingUser = () => ({
  type: LOADING_USER,
});

export const removeUserData = () => ({
  type: REMOVE_USER_DATA,
});

export const setUserData = ({ userToken, nameornym, avatarUri }) => ({
  type: USER_DATA,
  userToken,
  nameornym,
  avatarUri,
});

export const saveDataSuccess = ({ userToken, nameornym, avatarUri }) => ({
  type: SAVE_DATA_SUCCESS,
  nameornym,
  avatarUri,
  userToken,
});
