// @flow

export const SET_IS_SPONSORED = 'SET_IS_SPONSORED';
export const USER_SCORE = 'USER_SCORE';
export const SEARCH_PARAM = 'SEARCH_PARAM';
export const CREATE_GROUP = 'CREATE_GROUP';
export const DELETE_GROUP = 'DELETE_GROUP';
export const SET_NEW_GROUP_CO_FOUNDERS = 'SET_NEW_GROUP_CO_FOUNDERS';
export const CLEAR_NEW_GROUP_CO_FOUNDERS = 'CLEAR_NEW_GROUP_CO_FOUNDERS';
export const SET_GROUPS = 'SET_GROUPS';
export const SET_INVITES = 'SET_INVITES';
export const JOIN_GROUP = 'JOIN_GROUP';
export const LEAVE_GROUP = 'LEAVE_GROUP';
export const DISMISS_FROM_GROUP = 'DISMISS_FROM_GROUP';
export const REJECT_INVITE = 'REJECT_INVITE';
export const ACCEPT_INVITE = 'ACCEPT_INVITE';
export const SET_CONNECTIONS = 'SET_CONNECTIONS';
export const CONNECTIONS_SORT = 'CONNECTIONS_SORT';
export const DELETE_CONNECTION = 'DELETE_CONNECTION';
export const SET_USER_DATA = 'SET_USER_DATA';
export const SET_USER_NAME = 'SET_USER_NAME';
export const SET_USER_PHOTO = 'SET_USER_PHOTO';
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
export const SET_BACKUP_COMPLETED = 'SET_BACKUP_COMPLETED';
export const SET_PASSWORD = 'SET_PASSWORD';
export const SET_RECOVERY_DATA = 'SET_RECOVERY_DATA';
export const REMOVE_RECOVERY_DATA = 'REMOVE_RECOVERY_DATA';
export const SET_HASHED_ID = 'SET_HASHED_ID';
export const UPDATE_CONNECTIONS = 'UPDATE_CONNECTIONS';
export const ADD_CONNECTION = 'ADD_CONNECTION';
export const SET_USER_ID = 'SET_USER_ID';
export const HYDRATE_STATE = 'HYDRATE_STATE';
export const REMOVE_SAFE_PUB_KEY = 'REMOVE_SAFE_PUB_KEY';
export const RESET_STORE = 'RESET_STORE';
export const ADD_OPERATION = 'ADD_OPERATION';
export const REMOVE_OPERATION = 'REMOVE_OPERATION';
export const RESET_OPERATIONS = 'RESET_OPERATIONS';

/**
 * redux action creator that updates user `isSponsored`
 *
 * @param isSponsored boolean fetched from server
 *
 */

export const setIsSponsored = (isSponsored: boolean) => ({
  type: SET_IS_SPONSORED,
  isSponsored,
});

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
 * redux action creator for setting the search param used to filter connections array
 * @param type SEARCH_PARAM
 * @param value string used to filter connections
 */

export const setSearchParam = (searchParam: string) => ({
  type: SEARCH_PARAM,
  searchParam,
});

/**
 * redux action creator for create new group
 * @param group: new group
 */
export const createGroup = (group: group) => ({
  type: CREATE_GROUP,
  group,
});

export const deleteGroup = (group: group) => ({
  type: DELETE_GROUP,
  group,
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
 * redux action creator for set groups
 * @param groups: list of user groups
 */
export const setGroups = (groups: group[]) => ({
  type: SET_GROUPS,
  groups,
});

/**
 * redux action creator for set user invites
 * @param invites: list of user invites
 */
export const setInvites = (invites: invite[]) => ({
  type: SET_INVITES,
  invites,
});

export const joinGroup = (group: group) => ({
  type: JOIN_GROUP,
  group,
});

export const leaveGroup = (group: group) => ({
  type: LEAVE_GROUP,
  group,
});

export const dismissFromGroup = (member: string, group: group) => ({
  type: DISMISS_FROM_GROUP,
  group,
  member
});

export const rejectInvite = (invite: invite) => ({
  type: REJECT_INVITE,
  invite,
});

export const acceptInvite = (invite: invite) => ({
  type: ACCEPT_INVITE,
  invite,
});

export const setVerifications = (verifications: string[]) => ({
  type: SET_VERIFICATIONS,
  verifications,
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
 * @param type DELETE_CONNECTION
 * @param connection removes a connection object from the array of connections and removes id from connection ids
 */

export const deleteConnection = (id: string) => ({
  type: DELETE_CONNECTION,
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
 * redux action creator for setting user name
 * @param type SET_USER_NAME
 * @param name the username of the user
 */

export const setName = (name: string) => ({
  type: SET_USER_NAME,
  name,
});

/**
 * redux action creator for setting user photo
 * @param type SET_USER_PHOTO
 * @param photo base 64 string of user photo
 */

export const setPhoto = (photo: { filename: string }) => ({
  type: SET_USER_PHOTO,
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

export const addOperation = (op: string) => ({
  type: ADD_OPERATION,
  op,
});

export const removeOperation = (op: string) => ({
  type: REMOVE_OPERATION,
  op,
});

export const resetOperations = () => ({
  type: RESET_OPERATIONS,
});

export const resetStore = () => ({
  type: RESET_STORE,
});

export const updateConnections = (
  connections: Array<{ id: string, score: number, status: string }>,
) => ({
  type: UPDATE_CONNECTIONS,
  connections,
});
