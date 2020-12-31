// @flow

import CryptoJS from 'crypto-js';
import { retrieveImage } from '@/utils/filesystem';
import backupApi from '@/api/backupService';
import { hash } from '@/utils/encoding';

const hashId = (id: string, password: string) => {
  const h = hash(id + password);
  return h;
};

export const encryptAndBackup = (key: string, data: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  let {
    user: { id, password },
  } = getState();
  let hashedId = hashId(id, password);
  try {
    const encrypted = CryptoJS.AES.encrypt(data, password).toString();
    await backupApi.putRecovery(hashedId, key, encrypted);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const backupPhoto = (id: string, filename: string) => async (
  dispatch: dispatch,
  getState: getState,
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
      connections: { connections },
      groups: { groups },
      user: { id, photo },
    } = getState();
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
      user: { id, score, name, photo },
      connections: { connections },
      groups: { groups },
    } = getState();
    const userData = {
      id,
      name,
      score,
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
    const decrypted = CryptoJS.AES.decrypt(res.data, pass).toString(
      CryptoJS.enc.Utf8,
    );
    return decrypted;
  } catch (err) {
    throw new Error('bad password');
  }
};
