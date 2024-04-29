import CryptoJS from 'crypto-js';
import stringify from 'fast-json-stable-stringify';
import { retrieveImage } from '@/utils/filesystem';
import backupApi from '@/api/backupService';
import { hash } from '@/utils/encoding';
import { selectAllConnections } from '@/reducer/connectionsSlice';
import { selectAllSigs } from '@/reducer/appsSlice';
import { updateLastUploadedBackupDataHash } from '@/actions';

const hashId = (id: string, password: string) => {
  return hash(id + password);
};

export const encryptAndBackup =
  (key: string, data: string, override = true): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    const {
      user: { id, password },
      recoveryData: { lastUploadedBackupDataHashes },
    } = getState();
    const hashedId = hashId(id, password);
    const encrypted = CryptoJS.AES.encrypt(data, password).toString();
    const encryptedDataHash = hash(encrypted);
    if (
      override ||
      lastUploadedBackupDataHashes[hashedId] !== encryptedDataHash
    ) {
      try {
        await backupApi.putRecovery(hashedId, key, encrypted);
        dispatch(
          updateLastUploadedBackupDataHash({ hashedId, encryptedDataHash }),
        );
      } catch (err) {
        err instanceof Error ? console.warn(err.message) : console.warn(err);
      }
    }
  };

export const backupPhoto =
  (id: string, filename: string, override = true): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    try {
      const data = await retrieveImage(filename);
      await dispatch(encryptAndBackup(id, data, override));
    } catch (err) {
      err instanceof Error ? console.warn(err.message) : console.warn(err);
    }
  };

const backupPhotos =
  (override = true): AppThunk =>
  async (dispatch: AppDispatch, getState) => {
    try {
      const {
        groups: { groups },
        user: { id, photo },
      } = getState();
      const connections = selectAllConnections(getState());
      for (const item of connections) {
        if (item.photo?.filename) {
          await dispatch(backupPhoto(item.id, item.photo.filename, override));
        }
      }
      for (const item of groups) {
        if (item.photo?.filename) {
          await dispatch(backupPhoto(item.id, item.photo.filename, override));
        }
      }
      await dispatch(backupPhoto(id, photo.filename, override));
    } catch (err) {
      err instanceof Error ? console.warn(err.message) : console.warn(err);
    }
  };

export const backupUser =
  (override = true): AppThunk =>
  async (dispatch: AppDispatch, getState) => {
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
      dispatch(encryptAndBackup('data', dataStr, override));
    } catch (err) {
      err instanceof Error ? console.warn(err.message) : console.warn(err);
    }
  };

export const backupSigInfo =
  (sigInfo: SigInfo, override = true): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    try {
      const backupData = stringify(sigInfo);
      const backupKey = hash(
        `${sigInfo.app} ${sigInfo.verification} ${sigInfo.roundedTimestamp}`,
      );
      await dispatch(encryptAndBackup(backupKey, backupData, override));
    } catch (err) {
      err instanceof Error ? console.warn(err.message) : console.warn(err);
    }
  };

export const backupBlindSigs =
  (override = true): AppThunk =>
  async (dispatch: AppDispatch, getState) => {
    try {
      const allSigs = selectAllSigs(getState());
      for (const sig of allSigs) {
        await dispatch(backupSigInfo(sig, override));
      }
    } catch (err) {
      err instanceof Error ? console.warn(err.message) : console.warn(err);
    }
  };

export const backupAppData =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch) => {
    try {
      // backup user
      await dispatch(backupUser(false));
      // backup connection photos
      await dispatch(backupPhotos(false));
      // backup blind signatures
      await dispatch(backupBlindSigs(false));
    } catch (err) {
      err instanceof Error ? console.warn(err.message) : console.warn(err);
    }
  };

export const fetchBackupData =
  (key: string, id: string, pass: string): AppThunk<Promise<string>> =>
  async (dispatch: AppDispatch) => {
    try {
      const hashedId = hashId(id, pass);
      const res = await backupApi.getRecovery(hashedId, key);
      const encryptedDataHash = hash(res.data);
      dispatch(
        updateLastUploadedBackupDataHash({ hashedId, encryptedDataHash }),
      );
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
