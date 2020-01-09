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
export const SET_CONNECTIONS = 'SET_CONNECTIONS';
export const CONNECTIONS_SORT = 'CONNECTIONS_SORT';
export const REMOVE_CONNECTION = 'REMOVE_CONNECTION';
export const SET_USER_DATA = 'SET_USER_DATA';
export const USER_PHOTO = 'USER_PHOTO';
export const SET_CONNECT_QR_DATA = 'SET_CONNECT_QR_DATA';
export const REMOVE_CONNECT_QR_DATA = 'REMOVE_CONNECT_QR_DATA';
export const SET_CONNECT_USER_DATA = 'SET_CONNECT_USER_DATA';
export const REMOVE_CONNECT_USER_DATA = 'REMOVE_CONNECT_USER_DATA';
export const SET_VERIFICATIONS = 'SET_VERIFICATIONS';
export const SET_APPS = 'SET_APPS';
export const ADD_APP = 'ADD_APP';
export const REMOVE_APP = 'REMOVE_APP';
export const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS';
export const ADD_TRUSTED_CONNECTION = 'ADD_TRUSTED_CONNECTION';
export const REMOVE_TRUSTED_CONNECTION = 'REMOVE_TRUSTED_CONNECTION';
export const SET_TRUSTED_CONNECTIONS = 'SET_TRUSTED_CONNECTIONS';
export const SET_BACKUP_COMPLETED = 'SET_BACKUP_COMPLETED';
export const SET_PASSWORD = 'SET_PASSWORD';
export const SET_RECOVERY_DATA = 'SET_RECOVERY_DATA';
export const REMOVE_RECOVERY_DATA = 'REMOVE_RECOVERY_DATA';
export const SET_HASHED_ID = 'SET_HASHED_ID';
export const UPDATE_CONNECTION = 'UPDATE_CONNECTION';
export const UPDATE_CONNECTION_SCORES = 'UPDATE_CONNECTION_SCORES';
export const ADD_CONNECTION = 'ADD_CONNECTION';
export const SET_USER_ID = 'SET_USER_ID';
export const HYDRATE_STATE = 'HYDRATE_STATE';
export const REMOVE_SAFE_PUB_KEY = 'REMOVE_SAFE_PUB_KEY';
export const RESET_STORE = 'RESET_STORE';

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
 * @param coFounders: an array contain two ids of co-founders of new group.
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
export const setEligibleGroups = (eligibleGroups: group[]) => ({
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

export const setVerifications = (verifications: string[]) => ({
  type: SET_VERIFICATIONS,
  verifications,
});

/**
 * redux action creator for set user current groups
 * @param currentGroups: list of user current groups
 */
export const setCurrentGroups = (currentGroups: group[]) => ({
  type: SET_CURRENT_GROUPS,
  currentGroups,
});

export const joinGroup = (group: group) => ({
  type: JOIN_GROUP,
  group,
});

export const joinGroupAsCoFounder = (groupId: string) => ({
  type: JOIN_GROUP_AS_CO_FOUNDER,
  groupId,
});

export const leaveGroup = (groupId: string) => ({
  type: LEAVE_GROUP,
  groupId,
});

/**
 * redux action creator for setting connections array
 * @param type SET_CONNECTIONS
 * @param connections array of connections obtained from server and stored locally
 */

export const setConnections = (connections: connection[]) => ({
  type: SET_CONNECTIONS,
  connections,
});

/**
 * redux action creator for setting connections array
 * @param type UPDATE_CONNECTION
 * @param connection a single connection
 */

export const updateConnection = (connection: connection, index: number) => ({
  type: UPDATE_CONNECTION,
  connection,
  index,
});

/**
 * redux action creator for setting connections array
 * @param type ADD_CONNECTION
 * @param connection add a single connection
 */

export const addConnection = (connection: connection) => ({
  type: ADD_CONNECTION,
  connection,
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
 * @param connection removes a connection object from the array of connections and removes id from connection ids
 */

export const removeConnection = (id: string) => ({
  type: REMOVE_CONNECTION,
  id,
});

/**
 * redux action setting user data
 * @param type SET_USER_DATA
 * @param userData object containing important user data obtained from async storage during initialization
 */

export const setUserData = ({
  id,
  publicKey,
  secretKey,
  name,
  photo,
}: {
  id: string,
  publicKey: string,
  secretKey: Uint8Array,
  name: string,
  photo: { filename: string },
}) => ({
  type: SET_USER_DATA,
  id,
  publicKey,
  secretKey,
  name,
  photo,
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
  id: string,
  photo: string,
  score: number,
}) => ({
  type: SET_CONNECT_USER_DATA,
  connectUserData,
});

export const removeConnectUserData = () => ({
  type: REMOVE_CONNECT_USER_DATA,
});

export const setApps = (appInfos: AppInfo[]) => ({
  type: SET_APPS,
  apps: appInfos,
});

export const addApp = (appInfo: AppInfo) => ({
  type: ADD_APP,
  app: appInfo,
});

export const removeApp = (name: string) => ({
  type: REMOVE_APP,
  name,
});

export const setNotifications = (notificationInfos: NotificationInfo[]) => ({
  type: SET_NOTIFICATIONS,
  notifications: notificationInfos,
});

export const addTrustedConnection = (id: string) => ({
  type: ADD_TRUSTED_CONNECTION,
  id,
});

export const setTrustedConnections = (trustedConnections: string[]) => ({
  type: SET_TRUSTED_CONNECTIONS,
  trustedConnections,
});

export const removeTrustedConnection = (id: string) => ({
  type: REMOVE_TRUSTED_CONNECTION,
  id,
});

export const setBackupCompleted = (backupCompleted: boolean) => ({
  type: SET_BACKUP_COMPLETED,
  backupCompleted,
});

export const setPassword = (password: string) => ({
  type: SET_PASSWORD,
  password,
});

export const setRecoveryData = (recoveryData: {
  publicKey: string,
  id: string,
  secretKey: string,
  timestamp: number,
  sigs: Signature[],
}) => ({
  type: SET_RECOVERY_DATA,
  recoveryData,
});

export const removeRecoveryData = () => ({
  type: REMOVE_RECOVERY_DATA,
});

export const setHashedId = (hash: string) => ({
  type: SET_HASHED_ID,
  hash,
});

export const setUserId = (id: string) => ({
  type: SET_USER_ID,
  id,
});

export const hydrateState = (state: State) => ({
  type: HYDRATE_STATE,
  state,
});

export const removeSafePubKey = () => ({
  type: REMOVE_SAFE_PUB_KEY,
});

export const resetStore = () => ({
  type: RESET_STORE,
});

export const updateConnectionScores = (
  connections: Array<{ id: string, score: number }>,
) => ({
  type: UPDATE_CONNECTION_SCORES,
  connections,
});
