// @flow

export const USER_SCORE = 'USER_SCORE';
export const GROUPS_COUNT = 'GROUPS_COUNT';
export const SEARCH_PARAM = 'SEARCH_PARAM';
export const SET_NEW_GROUP_CO_FOUNDERS = 'SET_NEW_GROUP_CO_FOUNDERS';
export const CLEAR_NEW_GROUP_CO_FOUNDERS = 'CLEAR_NEW_GROUP_CO_FOUNDERS';
export const SET_ELIGIBLE_GROUPS = 'SET_ELIGIBLE_GROUPS';
export const DELETE_ELIGIBLE_GROUP = 'DELETE_ELIGIBLE_GROUP';
export const SET_CURRENT_GROUPS = 'SET_CURRENT_GROUPS';
export const JOIN_GROUP = 'JOIN_GROUP';
export const JOIN_GROUP_AS_CO_FOUNDER = 'JOIN_GROUP_AS_CO_FOUNDER';
export const LEAVE_GROUP = 'LEAVE_GROUP';
export const UPDATE_CONNECTIONS = 'UPDATE_CONNECTIONS';
export const CONNECTIONS_SORT = 'CONNECTIONS_SORT';
export const ADD_CONNECTION = 'ADD_CONNECTION';
export const REMOVE_CONNECTION = 'REMOVE_CONNECTION';
export const UPDATE_USER_DATA = 'UPDATE_USER_DATA';
export const REMOVE_USER_DATA = 'REMOVE_USER_DATA';
export const USER_PHOTO = 'USER_PHOTO';
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

export const setSearchParam = (searchParam: string) => ({
  type: SEARCH_PARAM,
  searchParam,
});

/**
 * redux action creator for set co-founders of new group
 * @param coFounders: an array contain two publicKeys of co-founders of new group.
 */
export const setNewGroupCoFounders = (newGroupCoFounders: string[]) => ({
  type: SET_NEW_GROUP_CO_FOUNDERS,
  newGroupCoFounders,
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
export const setEligibleGroups = (eligibleGroups: eligibleGroups) => ({
  type: SET_ELIGIBLE_GROUPS,
  eligibleGroups,
});

/**
 * redux action creator for set user eligible groups
 * @param eligibleGroups: list of user eligible groups
 */
export const deleteEligibleGroup = (groupId: string) => ({
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

export const joinGroup = (group) => ({
  type: JOIN_GROUP,
  group,
});

export const joinGroupAsCoFounder = (groupId) => ({
  type: JOIN_GROUP_AS_CO_FOUNDER,
  groupId,
});

export const leaveGroup = (groupId) => ({
  type: LEAVE_GROUP,
  groupId,
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
  safePubKey,
  secretKey,
  name,
  photo,
}: {
  publicKey: string,
  safePubKey: string,
  secretKey: Uint8Array,
  name: string,
  photo: { filename: string },
}) => ({
  type: UPDATE_USER_DATA,
  publicKey,
  safePubKey,
  secretKey,
  name,
  photo,
});

/**
 * redux action creator for reseting the app's store
 */

export const removeUserData = () => ({
  type: REMOVE_USER_DATA,
});

/**
 * redux action creator for setting user photo
 * @param type USER_PHOTO
 * @param photo base 64 string of user photo
 */

export const setPhoto = (photo: string) => ({
  type: USER_PHOTO,
  photo,
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
  name: string,
  publicKey: string,
  photo: string,
  score: number,
}) => ({
  type: SET_CONNECT_USER_DATA,
  connectUserData,
});

export const removeConnectUserData = () => ({
  type: REMOVE_CONNECT_USER_DATA,
});
