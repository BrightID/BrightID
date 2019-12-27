// @flow

import { Alert, AsyncStorage } from 'react-native';
import { createCipher, createDecipher } from 'react-native-crypto';
import nacl from 'tweetnacl';
import { retrieveImage, saveImage } from '../../../utils/filesystem';
import backupApi from '../../../Api/BackupApi';
import api from '../../../Api/BrightId';
import store from '../../../store';
import emitter from '../../../emitter';
import {
  setRecoveryData,
  removeRecoveryData,
  setBackupCompleted,
  setUserData,
  setConnections,
  setPassword,
} from '../../../actions';
import {
  uInt8ArrayToB64,
  b64ToUrlSafeB64,
  b64ToUint8Array,
} from '../../../utils/encoding';
import { saveConnection } from '../../../actions/connections';

const setTrustedConnections = async () => {
  try {
    const { trustedConnections } = store.getState().main;
    await api.setTrusted(trustedConnections);
  } catch (err) {
    console.warn(err);
  }
};

export const encryptAndBackup = async (
  k1: string,
  k2: string,
  data: string,
) => {
  const { password } = store.getState().main;
  try {
    const cipher = createCipher('aes128', password);
    const encrypted =
      cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
    await backupApi.putRecovery(k1, k2, encrypted);
    emitter.emit('backupProgress', 1);
  } catch (err) {
    console.warn(err);
    emitter.emit('backupProgress', 0);
  }
};

const backupPhoto = async (id1: string, filename: string) => {
  try {
    const { id } = store.getState().main;
    const data = await retrieveImage(filename);
    await encryptAndBackup(id, id1, data);
  } catch (err) {
    console.warn(err);
  }
};

const backupConnectionPhotos = async () => {
  try {
    const { connections } = store.getState().main;
    for (const item of connections) {
      await backupPhoto(item.id, item.photo.filename);
    }
  } catch (err) {
    console.warn(err);
  }
};

const backupUser = async () => {
  try {
    const {
      score,
      name,
      photo,
      id,
      connections,
      trustedConnections,
    } = store.getState().main;
    const userData = {
      id,
      name,
      score,
      photo,
    };
    const dataStr = JSON.stringify({
      userData,
      connections,
      trustedConnections,
    });
    await encryptAndBackup(id, 'data', dataStr);
    await backupPhoto(id, photo.filename);
  } catch (err) {
    console.warn(err);
  }
};

export const backupAppData = async () => {
  try {
    // set trusted connections first
    await setTrustedConnections();
    // backup user
    await backupUser();
    // backup connection photos
    await backupConnectionPhotos();
  } catch (err) {
    console.warn(err);
  }
};

export const setupRecovery = () => {
  const { timestamp } = store.getState().main.recoveryData;
  if (timestamp) return;

  const { publicKey, secretKey } = nacl.sign.keyPair();
  const recoveryData = {
    publicKey: uInt8ArrayToB64(publicKey),
    secretKey: uInt8ArrayToB64(secretKey),
    timestamp: Date.now(),
    sigs: [],
  };
  store.dispatch(setRecoveryData(recoveryData));
  return recoveryData;
};

export const recoveryQrStr = () => {
  const {
    publicKey: signingKey,
    timestamp,
  } = store.getState().main.recoveryData;
  return `Recovery_${JSON.stringify({ signingKey, timestamp })}`;
};

export const sigExists = (data: Signature) => {
  const { recoveryData } = store.getState().main;
  return (
    recoveryData.sigs.length === 1 &&
    recoveryData.sigs[0].sig === data.sig &&
    recoveryData.sigs[0].signer === data.signer &&
    recoveryData.sigs[0].id === data.id
  );
};

export const handleSigs = async (data?: Signature) => {
  if (!data || sigExists(data)) return;
  const { recoveryData } = store.getState().main;
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
    const sigs = recoveryData.sigs.map((sig) => ({
      id: sig.signer,
      sig: sig.sig,
    }));
    try {
      await api.setSigningKey(
        recoveryData.id,
        recoveryData.publicKey,
        sigs,
        recoveryData.timestamp,
      );
      return true;
    } catch (err) {
      console.warn(err);
    }
  }
};

export const fetchBackupData = async (k1: string, k2: string, pass: string) => {
  try {
    const decipher = createDecipher('aes128', pass);
    const res = await backupApi.getRecovery(k1, k2);
    const decrypted =
      decipher.update(res.data, 'base64', 'utf8') + decipher.final('utf8');
    return decrypted;
  } catch (err) {
    Alert.alert('Error', 'Incorrect password!');
    console.warn(err);
  }
};

export const restoreUserData = async (pass: string) => {
  try {
    const { id, secretKey, publicKey } = store.getState().main.recoveryData;
    const decrypted = await fetchBackupData(id, 'data', pass);
    if (decrypted) {
      const { userData, connections } = JSON.parse(decrypted);
      console.log(JSON.parse(decrypted));
      emitter.emit('restoreTotal', connections.length + 2);
      userData.id = id;
      userData.publicKey = publicKey;
      userData.secretKey = b64ToUint8Array(secretKey);

      const userPhoto = await fetchBackupData(id, id, pass);
      if (userPhoto) {
        const filename = await saveImage({
          imageName: id,
          base64Image: decrypted,
        });
        userData.photo = { filename };
      }
      store.dispatch(setUserData(userData));
      store.dispatch(setConnections(connections));

      // TODO REMOVE THIS FOR V1 / add trusted connections
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      return connections;
    }
  } catch (err) {
    Alert.alert('Error', 'Cannot Decrypt Recovery Data');
    console.warn(err);
  }
};

export const recoverData = async (pass: string) => {
  try {
    const { id } = store.getState().main.recoveryData;
    const connections = await restoreUserData(pass);
    if (!connections) return;
    for (const conn of connections) {
      let decrypted = await fetchBackupData(id, conn.id, pass);
      const filename = await saveImage({
        imageName: conn.id,
        base64Image: decrypted,
      });
      conn.photo = { filename };
      // add connection inside of async storage
      await saveConnection(conn);
    }

    store.dispatch(setBackupCompleted(true));
    // password is required to update backup when user makes new connections
    store.dispatch(setPassword(pass));
    store.dispatch(removeRecoveryData());
    return true;
  } catch (err) {
    // if (err.message == 'unable to decrypt data') {
    //   this.setState({ restoreInProgress: false, completed: 0 });
    //   Alert.alert('Error', 'Incorrect password!');
    // } else {
    console.warn(err);
    // }
  }
};
