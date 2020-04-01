// @flow

import { Alert } from 'react-native';
import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import {
  createImageDirectory,
  retrieveImage,
  saveImage,
} from '@/utils/filesystem';
import backupApi from '@/Api/BackupApi';
import api from '@/Api/BrightId';
import store from '@/store';
import emitter from '@/emitter';
import {
  setRecoveryData,
  removeRecoveryData,
  setBackupCompleted,
  setUserData,
  setConnections,
  setPassword,
  setHashedId,
  setGroups,
} from '@/actions';
import {
  uInt8ArrayToB64,
  b64ToUint8Array,
  strToUint8Array,
  safeHash,
} from '@/utils/encoding';

export const setTrustedConnections = async () => {
  const { trustedConnections } = store.getState();
  await api.setTrusted(trustedConnections);
  return true;
};

const hashId = (id: string, password: string) => {
  const hash = safeHash(id + password);
  store.dispatch(setHashedId(hash));
  return hash;
};

export const encryptAndBackup = async (key: string, data: string) => {
  let { id, hashedId, password } = store.getState();
  if (!hashedId) hashedId = hashId(id, password);
  try {
    // const cipher = createCipher('aes128', password);
    // const encrypted =
    //   cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
    const encrypted = CryptoJS.AES.encrypt(data, password).toString();
    await backupApi.putRecovery(hashedId, key, encrypted);
    emitter.emit('backupProgress', 1);
  } catch (err) {
    emitter.emit('backupProgress', 0);
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const backupPhoto = async (id: string, filename: string) => {
  try {
    const data = await retrieveImage(filename);
    await encryptAndBackup(id, data);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

const backupPhotos = async () => {
  try {
    const { connections, groups, id, photo } = store.getState();
    for (const item of connections) {
      await backupPhoto(item.id, item.photo?.filename);
    }
    for (const item of groups) {
      if (item.photo?.filename) {
        await backupPhoto(item.id, item.photo.filename);
      }
    }
    await backupPhoto(id, photo.filename);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const backupUser = async () => {
  try {
    const { score, name, photo, id, connections, groups } = store.getState();
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
    await encryptAndBackup('data', dataStr);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const backupAppData = async () => {
  try {
    // backup user
    await backupUser();
    // backup connection photos
    await backupPhotos();
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const setupRecovery = async () => {
  let { recoveryData } = store.getState();
  recoveryData.sigs = [];
  store.dispatch(setRecoveryData(recoveryData));
  if (recoveryData.timestamp) return;

  const { publicKey, secretKey } = await nacl.sign.keyPair();
  recoveryData = {
    publicKey: uInt8ArrayToB64(publicKey),
    secretKey: uInt8ArrayToB64(secretKey),
    id: '',
    timestamp: Date.now(),
    sigs: [],
  };
  store.dispatch(setRecoveryData(recoveryData));
  return recoveryData;
};

export const recoveryQrStr = () => {
  const { publicKey: signingKey, timestamp } = store.getState().recoveryData;
  return `Recovery_${JSON.stringify({ signingKey, timestamp })}`;
};

export const parseRecoveryQr = (
  qrString: string,
): { signingKey: string, timestamp: number } => {
  try {
    const data = JSON.parse(qrString.replace('Recovery_', ''));
    if (!data.signingKey || !data.timestamp) {
      throw new Error('Bad QR Data');
    } else {
      return data;
    }
  } catch (err) {
    throw new Error('Bad QR Data');
  }
};

export const setRecoverySig = async (
  id: string,
  signingKey: string,
  timestamp: number,
) => {
  const { id: userId, secretKey } = store.getState();
  const message = `Set Signing Key${id}${signingKey}${timestamp}`;
  const sig = uInt8ArrayToB64(
    nacl.sign.detached(strToUint8Array(message), secretKey),
  );
  const data = { signer: userId, id, sig };
  await backupApi.setSig(data, signingKey);
  return true;
};

export const sigExists = (data: Signature) => {
  const { recoveryData } = store.getState();
  return (
    recoveryData.sigs.length === 1 &&
    recoveryData.sigs[0].sig === data.sig &&
    recoveryData.sigs[0].signer === data.signer &&
    recoveryData.sigs[0].id === data.id
  );
};

export const handleSigs = async (data?: Signature) => {
  if (!data || sigExists(data)) return;
  const { recoveryData } = store.getState();
  if (
    (recoveryData.sigs[0] && recoveryData.sigs[0].id !== data.id) ||
    recoveryData.sigs.length === 0
  ) {
    recoveryData.id = data.id;
    recoveryData.sigs = [data];
    store.dispatch(setRecoveryData(recoveryData));
    Alert.alert('Info', 'One of your trusted connections signed your request');
  } else {
    recoveryData.sigs[1] = data;
    store.dispatch(setRecoveryData(recoveryData));
    return true;
  }
};

export const setSigningKey = async () => {
  const { recoveryData } = store.getState();
  console.log('setting signing key');
  try {
    await api.setSigningKey({
      id: recoveryData.id,
      signingKey: recoveryData.publicKey,
      timestamp: recoveryData.timestamp,
      id1: recoveryData.sigs[0].signer,
      id2: recoveryData.sigs[1].signer,
      sig1: recoveryData.sigs[0].sig,
      sig2: recoveryData.sigs[1].sig,
    });
  } catch (err) {
    recoveryData.sigs = [];
    store.dispatch(setRecoveryData(recoveryData));
    throw new Error('bad sigs');
  }
};

export const fetchBackupData = async (key: string, pass: string) => {
  try {
    const hashedId = hashId(store.getState().recoveryData.id, pass);
    const res = await backupApi.getRecovery(hashedId, key);
    const decrypted = CryptoJS.AES.decrypt(res.data, pass).toString(
      CryptoJS.enc.Utf8,
    );
    emitter.emit('restoreProgress', 1);
    return decrypted;
  } catch (err) {
    emitter.emit('restoreProgress', 0);
    Alert.alert('Error', 'Incorrect password!');
    throw new Error('bad password');
  }
};

export const restoreUserData = async (pass: string) => {
  const { id, secretKey, publicKey } = store.getState().recoveryData;

  const decrypted = await fetchBackupData('data', pass);

  const { userData, connections, groups = [] } = JSON.parse(decrypted);
  if (!userData || !connections) {
    throw new Error('bad password');
  }
  const groupsPhotoCount = groups.filter((group) => group.photo?.filename)
    .length;
  emitter.emit('restoreTotal', connections.length + groupsPhotoCount + 2);
  userData.id = id;
  userData.publicKey = publicKey;
  userData.secretKey = b64ToUint8Array(secretKey);

  const userPhoto = await fetchBackupData(id, pass);
  if (userPhoto) {
    const filename = await saveImage({
      imageName: id,
      base64Image: userPhoto,
    });
    userData.photo = { filename };
  }

  return { userData, connections, groups };
};

export const recoverData = async (pass: string) => {
  // fetch user data / save photo
  await createImageDirectory();
  // throws if data is bad
  const { userData, connections, groups } = await restoreUserData(pass);

  // set new signing key on the backend
  await setSigningKey();

  store.dispatch(setUserData(userData));
  store.dispatch(setConnections(connections));
  store.dispatch(setGroups(groups));

  for (const conn of connections) {
    let decrypted = await fetchBackupData(conn.id, pass);
    const filename = await saveImage({
      imageName: conn.id,
      base64Image: decrypted,
    });
    conn.photo = { filename };
  }

  for (const group of groups) {
    if (group.photo?.filename) {
      let decrypted = await fetchBackupData(group.id, pass);
      await saveImage({
        imageName: group.id,
        base64Image: decrypted,
      });
    }
  }

  store.dispatch(setBackupCompleted(true));
  // password is required to update backup when user makes new connections
  store.dispatch(setPassword(pass));
  store.dispatch(removeRecoveryData());
  return true;
};
