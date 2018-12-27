// @flow

export const USER_SCORE = 'USER_SCORE';
export const CONNECTION_TRUST_SCORE = 'CONNECTION_TRUST_SCORE';
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
export const RTC_ID = 'RTC_ID';
export const ARBITER = 'ARBITER';
export const RESET_WEBRTC = 'RESET_WEBRTC';
export const REFRESH_NEARBY_PEOPLE = 'REFRESH_NEARBY_PEOPLE';
export const CONNECT_PUBLICKEY = 'CONNECT_PUBLICKEY';
export const CONNECT_NAMEORNYM = 'CONNECT_NAMEORNYM';
export const CONNECT_TRUST_SCORE = 'CONNECT_TRUST_SCORE';
export const CONNECT_TIMESTAMP = 'CONNECT_TIMESTAMP';
export const CONNECT_RECIEVED_TIMESTAMP = 'CONNECT_RECIEVED_TIMESTAMP';
export const CONNECT_RECIEVED_TRUSTSCORE = 'CONNECT_RECIEVED_TRUSTSCORE';
export const CONNECT_RECIEVED_NAMEORNYM = 'CONNECT_RECIEVED_NAMEORNYM';
export const CONNECT_RECIEVED_PUBLICKEY = 'CONNECT_RECIEVED_PUBLICKEY';
export const CONNECT_RECIEVED_AVATAR = 'CONNECT_RECIEVED_AVATAR';
export const SET_CONNECT_QR_DATA = 'SET_CONNECT_QR_DATA';
export const REMOVE_CONNECT_QR_DATA = 'REMOVE_CONNECT_QR_DATA';
export const CONNECT_AVATAR = 'CONNECT_AVATAR';
export const ERROR = 'ERROR';
export const BOX_KEYPAIR = 'BOX_KEYPAIR';
export const SET_PREVIEW = 'SET_PREVIEW';
export const RESET_PREVIEW = 'RESET_PREVIEW';
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
 * @param type CONNECTION_TRUST_SCORE
 * @param publicKey Uint8Array to identify connection
 * @param trustScore string fetched from server
 *
 */

export const connectionTrustScore = (
  publicKey: Uint8Array,
  trustScore: string,
) => ({
  type: CONNECTION_TRUST_SCORE,
  publicKey,
  trustScore,
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
  trustScore: string,
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

export const setavatar = (avatar: string) => ({
  type: USER_AVATAR,
  avatar,
});

/**
 * redux action creator for setting user avatar
 * @param type USER_AVATAR
 * @param avatar string representaiton of user avatar encoded in base64 format
 */

export const setBoxKeypair = (keypair: {
  publicKey: Uint8Array,
  secretKey: Uint8Array,
}) => ({
  type: BOX_KEYPAIR,
  keypair,
});

/**
 * redux action creator for setting the public key of the user you are currently connecting with via webrtc
 * @param type CONNECT_PUBLICKEY
 * @param publicKey public key of new user while adding a new connection
 */

export const setConnectPublicKey = (publicKey: Uint8Array) => ({
  type: CONNECT_PUBLICKEY,
  publicKey,
});

/**
 * redux action creator for setting the public key of the user you are currently connecting with via webrtc
 * @param type CONNECT_PUBLICKEY
 * @param publicKey public key of new user while adding a new connection
 */

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
}) => ({
  type: SET_CONNECT_USER_DATA,
  connectUserData,
});

export const removeConnectUserData = () => ({
  type: REMOVE_CONNECT_USER_DATA,
});

/**
 * redux action creator for setting the nameornym of the user you are currently connecting with via webrtc
 * @param type CONNECT_NAMEORNYM
 * @param nameornym - nameornym of new user while adding a new connection
 */

export const setConnectNameornym = (nameornym: string) => ({
  type: CONNECT_NAMEORNYM,
  nameornym,
});

/**
 * redux action creator for setting the trust score of the user you are currently connecting with via webrtc
 * @param type CONNECT_TRUST_SCORE
 * @param nameornym - nameornym of new user while adding a new connection
 */

export const setConnectTrustScore = (trustScore: string) => ({
  type: CONNECT_TRUST_SCORE,
  trustScore,
});

/**
 * redux action creator for setting the avatar of the user you are currently connecting with via webrtc
 * @param type CONNECT_NAMEORNYM
 * @param nameornym - nameornym of new user while adding a new connection
 */

export const setConnectAvatar = (avatar: string) => ({
  type: CONNECT_AVATAR,
  avatar,
});

/**
 * redux action creator for setting the timestamp used while forming a new connection with a user
 * @param type CONNECT_TIMESTAMP
 * @param  timestamp - unix timestamp of used for generating a message while forming a new connection
 */

export const setConnectTimestamp = (timestamp: number) => ({
  type: CONNECT_TIMESTAMP,
  timestamp,
});

/**
 * redux action creator for setting that trust score was received on the other end of webrtc data channel
 * @param type CONNECT_TRUST_SCORE
 *
 */

export const setConnectRecievedTrustScore = () => ({
  type: CONNECT_RECIEVED_TRUSTSCORE,
});

/**
 * redux action creator for setting that public key was received on the other end of webrtc data channel
 * @param type CONNECT_RECIEVED_PUBLICKEY
 *
 */

export const setConnectRecievedPublicKey = () => ({
  type: CONNECT_RECIEVED_PUBLICKEY,
});

/**
 * redux action creator for setting that avatar was received on the other end of webrtc data channel
 * @param type CONNECT_RECIEVED_AVATAR
 *
 */

export const setConnectRecievedAvatar = () => ({
  type: CONNECT_RECIEVED_AVATAR,
});

/**
 * redux action creator for transferring connect user data to preview user data
 * @param type SET_PREVIEW
 *
 */

export const setPreview = () => ({
  type: SET_PREVIEW,
});

/**
 * redux action creator for resetting preview data
 * @param type RESET PREVIEW
 *
 */

export const resetPreview = () => ({
  type: RESET_PREVIEW,
});

/**
 * redux action creator for setting that public key was received on the other end of webrtc data channel
 * @param type CONNECT_RECIEVED_NAMEORNYM
 *
 */

export const setConnectRecievedNameornym = () => ({
  type: CONNECT_RECIEVED_NAMEORNYM,
});

/**
 * redux action creator for setting that public key was received on the other end of webrtc data channel
 * @param type CONNECT_RECIEVED_TIMESTAMP
 *
 */

export const setConnectRecievedTimestamp = () => ({
  type: CONNECT_RECIEVED_TIMESTAMP,
});

/**
 * redux action sets rtc token info necessary for webrtc data channel
 * @param type RTC_ID
 *  @param rtcId webrtc signalling object
 */

export const setRtcId = (rtcId: string) => ({
  type: RTC_ID,
  rtcId,
});

/**
 * redux action sets arbiter info necessary for webrtc data channel
 * @param type ARBITER
 *  @param arbiter webrtc signalling object
 */

export const setArbiter = (arbiter: {
  USERA: {
    OFFER: Array<number>,
    ICE_CONNECTION: Array<number>,
    PUBLIC_KEY: Array<number>,
  },
  USERB: {
    ANSWER: Array<number>,
    ICE_CONNECTION: Array<number>,
    PUBLIC_KEY: Array<number>,
  },
}) => ({
  type: ARBITER,
  arbiter,
});

/**
 * redux action reset webrtc connection info
 * removes from redux store: rtcId, arbiter
 * @param type RESET_WEBRTC
 */

export const resetWebrtc = () => ({
  type: RESET_WEBRTC,
});

/**
 * redux action creator for refreshing nearby people
 * @param type REFRESH_NEARBY_PEOPLE
 * @param nearbyPeople array of nearby people
 */

export const refreshNearbyPeople = (nearbyPeople: Array<{}>) => ({
  type: REFRESH_NEARBY_PEOPLE,
  nearbyPeople,
});

/**
 * redux action creator for handling errors
 * @param type ERROR
 * @param error error message string
 */

export const handleError = (error: string) => ({
  type: ERROR,
  error,
});
