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
export const RTC_ID = 'RTC_ID';
export const ARBITER = 'ARBITER';
export const RESET_WEBRTC = 'RESET_WEBRTC';
export const REFRESH_NEARBY_PEOPLE = 'REFRESH_NEARBY_PEOPLE';
export const CONNECT_PUBLICKEY = 'CONNECT_PUBLICKEY';
export const CONNECT_NAMEORNYM = 'CONNECT_NAMEORNYM';
export const CONNECT_TRUST_SCORE = 'CONNECT_TRUST_SCORE';
export const CONNECT_TIMESTAMP = 'CONNECT_TIMESTAMP';
export const CONNECT_AVATAR = 'CONNECT_AVATAR';
export const ERROR = 'ERROR';
export const BOX_KEYPAIR = 'BOX_KEYPAIR';

/**
 * redux action creator that updates user `trustScore`
 * @param type USER_TRUST_SCORE
 * @param trustScore string fetched from server
 *
 */

export const userTrustScore = (trustScore: string) => ({
  type: USER_TRUST_SCORE,
  trustScore,
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
 * redux action creator for setting connections array
 * @param type UPDATE_CONNECTIONS
 * @param connections array of connections obtained from server and stored locally
 */

export const setConnections = (connections: Array<{}>) => ({
  type: UPDATE_CONNECTIONS,
  connections,
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
 * redux action setting user data
 * @param type UPDATE_USER_DATA
 * @param userData object containing important user data obtained from async storage during initialization
 */

export const setUserData = ({
  publicKey,
  secretKey,
  nameornym,
  userAvatar,
}: {
  publicKey: Uint8Array,
  secretKey: Uint8Array,
  nameornym: string,
  userAvatar: string,
}) => ({
  type: UPDATE_USER_DATA,
  publicKey,
  secretKey,
  nameornym,
  userAvatar,
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
 * @param userAvatar string representaiton of user avatar encoded in base64 format
 */

export const setUserAvatar = (userAvatar: string) => ({
  type: USER_AVATAR,
  userAvatar,
});

/**
 * redux action creator for setting user avatar
 * @param type USER_AVATAR
 * @param userAvatar string representaiton of user avatar encoded in base64 format
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
