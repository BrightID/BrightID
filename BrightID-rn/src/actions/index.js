// @flow

export const USER_TRUST_SCORE = 'USER_TRUST_SCORE';
export const CONNECTION_TRUST_SCORE = 'CONNECTION_TRUST_SCORE';
export const GROUPS_COUNT = 'GROUPS_COUNT';
export const SEARCH_PARAM = 'SEARCH_PARAM';
export const UPDATE_CONNECTIONS = 'UPDATE_CONNECTIONS';
export const ADD_CONNECTION = 'ADD_CONNECTION';
export const UPDATE_USER_DATA = 'UPDATE_USER_DATA';
export const REMOVE_USER_DATA = 'REMOVE_USER_DATA';
export const USER_AVATAR = 'USER_AVATAR';
export const REFRESH_NEARBY_PEOPLE = 'REFRESH_NEARBY_PEOPLE';
export const PUBLICKEY2 = 'PUBLICKEY2';
export const ERROR = 'ERROR';

/**
 * Redux boilerplate, pass data through the app
 * Async actions / async functions can be implemented
 *
 * @param type derived from constants
 * @param payload data passed into the redux reducer
 *
 */

export const userTrustScore = (trustScore: string) => ({
  type: USER_TRUST_SCORE,
  trustScore,
});

export const connectionTrustScore = (
  publicKey: Array<number>,
  trustScore: string,
) => ({
  type: CONNECTION_TRUST_SCORE,
  publicKey,
  trustScore,
});

export const setGroupsCount = (groupsCount: number) => ({
  type: GROUPS_COUNT,
  groupsCount,
});

export const setSearchParam = (value: string) => ({
  type: SEARCH_PARAM,
  value,
});

export const setConnections = (connections: Array<{}>) => ({
  type: UPDATE_CONNECTIONS,
  connections,
});

export const addConnection = (connection: Object) => ({
  type: ADD_CONNECTION,
  connection,
});

export const setUserData = ({
  publicKey,
  secretKey,
  nameornym,
  userAvatar,
}: {
  publicKey: Array<number>,
  secretKey: Array<number>,
  nameornym: string,
  userAvatar: string,
}) => ({
  type: UPDATE_USER_DATA,
  publicKey,
  secretKey,
  nameornym,
  userAvatar,
});

export const removeUserData = () => ({
  type: REMOVE_USER_DATA,
});

export const setUserAvatar = (userAvatar: string) => ({
  type: USER_AVATAR,
  userAvatar,
});

export const setPublicKey2 = (publicKey2: Array<number>) => ({
  type: PUBLICKEY2,
  publicKey2,
});

export const refreshNearbyPeople = (nearbyPeople: Array<{}>) => ({
  type: REFRESH_NEARBY_PEOPLE,
  nearbyPeople,
});

export const handleError = (error: string) => ({
  type: ERROR,
  error,
});
