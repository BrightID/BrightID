// @flow

export const USER_SCORE = 'USER_SCORE';
export const CONNECTION_SCORE = 'CONNECTION_SCORE';
export const GROUPS_COUNT = 'GROUPS_COUNT';
export const SEARCH_PARAM = 'SEARCH_PARAM';
export const SET_NEW_GROUP_CO_FOUNDERS = 'SET_NEW_GROUP_CO_FOUNDERS';
export const CLEAR_NEW_GROUP_CO_FOUNDERS = 'CLEAR_NEW_GROUP_CO_FOUNDERS';
export const SET_ELIGIBLE_GROUPS = 'SET_ELIGIBLE_GROUPS';
export const DELETE_ELIGIBLE_GROUP = 'DELETE_ELIGIBLE_GROUP';
export const SET_CURRENT_GROUPS = 'SET_CURRENT_GROUPS';
export const UPDATE_CONNECTIONS = 'UPDATE_CONNECTIONS';
export const CONNECTIONS_SORT = 'CONNECTIONS_SORT';
export const ADD_CONNECTION = 'ADD_CONNECTION';
export const REMOVE_CONNECTION = 'REMOVE_CONNECTION';
export const UPDATE_USER_DATA = 'UPDATE_USER_DATA';
export const REMOVE_USER_DATA = 'REMOVE_USER_DATA';
export const USER_AVATAR = 'USER_AVATAR';
export const SET_CONNECT_QR_DATA = 'SET_CONNECT_QR_DATA';
export const REMOVE_CONNECT_QR_DATA = 'REMOVE_CONNECT_QR_DATA';
export const SET_CONNECT_USER_DATA = 'SET_CONNECT_USER_DATA';
export const REMOVE_CONNECT_USER_DATA = 'REMOVE_CONNECT_USER_DATA';

/**
 * redux action creator that updates user `score`
 *
 * @param score number fetched from server
 *
 */

export const setUserScore = (score: number) => ({
  type: USER_SCORE,
  score,
});

/**
 * redux action creator that updates a connection's trust score in the connection array
 * @param type CONNECTION_SCORE
 * @param publicKey Uint8Array to identify connection
 * @param score string fetched from server
 *
 */

export const connectionScore = (
  publicKey: Uint8Array,
  score: number,
) => ({
  type: CONNECTION_SCORE,
  publicKey,
  score,
});

/**
 * redux action creator updates the Group Count
 * unneccessary after group API is created
 *
 */

export const setGroupsCount = (groupsCount: number) => ({
  type: GROUPS_COUNT,
  groupsCount,
});

/**
 * redux action creator for setting the search param used to filter connections array
 * @param type SEARCH_PARAM
 * @param value string used to filter connections
 */

export const setSearchParam = (value: string) => ({
  type: SEARCH_PARAM,
  value,
});

/**
 * redux action creator for set co-founders of new group
 * @param coFounders: an array contain two publicKeys of co-founders of new group.
 */
export const setNewGroupCoFounders = (coFounders: Array<Uint8Array>) => ({
  type: SET_NEW_GROUP_CO_FOUNDERS,
  coFounders,
});

/**
 * redux action creator for clear co-founders of new group
 */
export const clearNewGroupCoFounders = () => ({
  type: CLEAR_NEW_GROUP_CO_FOUNDERS,
});

/**
 * redux action creator for set user eligible groups
 * @param eligibleGroups: list of user eligible groups
 */
export const setEligibleGroups = (eligibleGroups) => ({
  type: SET_ELIGIBLE_GROUPS,
  eligibleGroups,
});

/**
 * redux action creator for set user eligible groups
 * @param eligibleGroups: list of user eligible groups
 */
export const deleteEligibleGroup = (groupId) => ({
  type: DELETE_ELIGIBLE_GROUP,
  groupId,
});

/**
 * redux action creator for set user current groups
 * @param currentGroups: list of user current groups
 */
export const setCurrentGroups = (currentGroups) => ({
  type: SET_CURRENT_GROUPS,
  currentGroups,
});

/**
 * redux action creator for setting connections array
 * @param type UPDATE_CONNECTIONS
 * @param connections array of connections obtained from server and stored locally
 */

export const setConnections = (connections: Array<{}>) => ({
  type: UPDATE_CONNECTIONS,
  connections,
});

/**
 * redux action creator for setting connections array
 * @param type CONNECTION_SORT
 * @param connections array of connections obtained from server and stored locally
 */

export const setConnectionsSort = (connectionsSort: string) => ({
  type: CONNECTIONS_SORT,
  connectionsSort,
});

/**
 * redux action creator for adding a connection
 * @param type ADD_CONNECTION
 * @param connection appends a new connection object to the array of connections
 */

export const addConnection = (connection: {
  publicKey: Uint8Array,
  nameornym: string,
  avatar: string,
  score: number,
  connectionDate: string,
}) => ({
  type: ADD_CONNECTION,
  connection,
});

/**
 * redux action creator for removing a connection
 * @param type REMOVE_CONNECTION
 * @param connection removes a connection object from the array of connections and removes public key from connection keys
 */

export const removeConnection = (publicKey: string) => ({
  type: REMOVE_CONNECTION,
  publicKey,
});

/**
 * redux action setting user data
 * @param type UPDATE_USER_DATA
 * @param userData object containing important user data obtained from async storage during initialization
 */

export const setUserData = ({
  publicKey,
  secretKey,
  nameornym,
  avatar,
}: {
  publicKey: Uint8Array,
  secretKey: Uint8Array,
  nameornym: string,
  avatar: { uri: string },
}) => ({
  type: UPDATE_USER_DATA,
  publicKey,
  secretKey,
  nameornym,
  avatar,
});

/**
 * redux action creator for reseting the app's store
 */

export const removeUserData = () => ({
  type: REMOVE_USER_DATA,
});

/**
 * redux action creator for setting user avatar
 * @param type USER_AVATAR
 * @param avatar string representaiton of user avatar encoded in base64 format
 */

export const setPhoto = (avatar: string) => ({
  type: USER_AVATAR,
  avatar,
});

export const setConnectQrData = (connectQrData: {
  ipAddress: string,
  aesKey: string,
  uuid: string,
}) => ({
  type: SET_CONNECT_QR_DATA,
  connectQrData,
});

export const removeConnectQrData = () => ({
  type: REMOVE_CONNECT_QR_DATA,
});

export const setConnectUserData = (connectUserData: {
  nameornym: string,
  publicKey: Uint8Array,
  avatar: string,
  score: number,
}) => ({
  type: SET_CONNECT_USER_DATA,
  connectUserData,
});

export const removeConnectUserData = () => ({
  type: REMOVE_CONNECT_USER_DATA,
});


