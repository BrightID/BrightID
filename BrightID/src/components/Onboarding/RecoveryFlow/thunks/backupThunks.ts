import CryptoJS from 'crypto-js';
import { retrieveImage } from '@/utils/filesystem';
import backupApi from '@/api/backupService';
import { hash } from '@/utils/encoding';
import { selectAllConnections } from '@/reducer/connectionsSlice';

const hashId = (id: string, password: string) => {
  const h = hash(id + password);
  return h;
};

export const encryptAndBackup = (key: string, data: string) => async (
  _: dispatch,
  getState: getState,
) => {
  const {
    user: { id, password },
  } = getState();
  const hashedId = hashId(id, password);
  try {
    const encrypted = CryptoJS.AES.encrypt(data, password).toString();
    await backupApi.putRecovery(hashedId, key, encrypted);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const backupPhoto = (id: string, filename: string) => async (
  dispatch: dispatch,
) => {
  try {
    const data = await retrieveImage(filename);
    await dispatch(encryptAndBackup(id, data));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

const backupPhotos = () => async (dispatch: dispatch, getState: getState) => {
  try {
    const {
      groups: { groups },
      user: { id, photo },
    } = getState();
    const connections = selectAllConnections(getState());
    for (const item of connections) {
      if (item.photo?.filename) {
        await dispatch(backupPhoto(item.id, item.photo.filename));
      }
    }
    for (const item of groups) {
      if (item.photo?.filename) {
        await dispatch(backupPhoto(item.id, item.photo.filename));
      }
    }
    await dispatch(backupPhoto(id, photo.filename));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const backupUser = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    const {
      user: { id, name, photo },
      groups: { groups },
    } = getState();
    const connections = selectAllConnections(getState());

    const userData = {
      id,
      name,
      photo,
    };

    const dataStr = JSON.stringify({
      userData,
      connections,
      groups,
    });
    await dispatch(encryptAndBackup('data', dataStr));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const backupAppData = () => async (dispatch: dispatch) => {
  try {
    // backup user
    await dispatch(backupUser());
    // backup connection photos
    await dispatch(backupPhotos());
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const fetchBackupData = async (
  key: string,
  id: string,
  pass: string,
) => {
  try {
    const hashedId = hashId(id, pass);
    const res = await backupApi.getRecovery(hashedId, key);
    return CryptoJS.AES.decrypt(res.data, pass).toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.log(`Error while fetching backup data '${key}': ${err.message}`);
    if (err.message === 'CLIENT_ERROR') {
      // Any 4xx http code will end up as CLIENT_ERROR
      // We can not tell if
      //  - the data has vanished by itself on the backup server or
      //  - the user provided a wrong password (this will lead to trying non-existing file, as
      //    the password hash is part of the filename).
      // Assume user entered wrong password, hoping the backup server will never lose data.
      throw new Error('bad password');
    } else {
      // TODO Better error handling
      throw new Error('unknown error');
    }
  }
};
