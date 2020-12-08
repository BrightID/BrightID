// @flow

export const USER_SCORE = 'USER_SCORE';
export const SET_IS_SPONSORED = 'SET_IS_SPONSORED';
export const SET_USER_PHOTO = 'SET_USER_PHOTO';
export const SEARCH_PARAM = 'SEARCH_PARAM';
export const SET_USER_DATA = 'SET_USER_DATA';
export const SET_USER_NAME = 'SET_USER_NAME';
export const SET_BACKUP_COMPLETED = 'SET_BACKUP_COMPLETED';
export const SET_PASSWORD = 'SET_PASSWORD';
export const SET_HASHED_ID = 'SET_HASHED_ID';
export const SET_USER_ID = 'SET_USER_ID';
export const REMOVE_SAFE_PUB_KEY = 'REMOVE_SAFE_PUB_KEY';
export const SET_VERIFICATIONS = 'SET_VERIFICATIONS';
export const SET_EULA = 'SET_EULA';
export const HYDRATE_USER = 'HYDRATE_USER';

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
 * redux action creator for setting user photo
 * @param type SET_USER_PHOTO
 * @param photo base 64 string of user photo
 */

export const setPhoto = (photo: { filename: string }) => ({
  type: SET_USER_PHOTO,
  photo,
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
 * redux action creator for setting the EULA agreement
 * @param type SET_EULA
 * @param eula boolean used for EULA status
 */

export const setEula = (eula: string) => ({
  type: SET_EULA,
  eula,
});

/**
 * redux action setting user data
 * @param type SET_USER_DATA
 * @param userData object containing important user data obtained from async storage during initialization
 */

export const setUserData = ({
  id,
  name,
  photo,
  secretKey,
}: {
  id: string,
  name: string,
  photo: { filename: string },
  secretKey: string,
}) => ({
  type: SET_USER_DATA,
  id,
  name,
  photo,
  secretKey,
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

export const setBackupCompleted = (backupCompleted: boolean) => ({
  type: SET_BACKUP_COMPLETED,
  backupCompleted,
});

export const setPassword = (password: string) => ({
  type: SET_PASSWORD,
  password,
});

export const setHashedId = (hash: string) => ({
  type: SET_HASHED_ID,
  hash,
});

export const setUserId = (id: string) => ({
  type: SET_USER_ID,
  id,
});

export const removeSafePubKey = () => ({
  type: REMOVE_SAFE_PUB_KEY,
});

export const setVerifications = (verifications: string[]) => ({
  type: SET_VERIFICATIONS,
  verifications,
});

export const hydrateUser = (data: {
  score: number,
  name: string,
  photo: { filename: string },
  backupCompleted: boolean,
  id: string,
  password: string,
  hashedId: string,
  secretKey: string,
}) => ({
  type: HYDRATE_USER,
  data,
});
