// @flow

import nacl from 'tweetnacl';
import { createImageDirectory, saveImage } from '@/utils/filesystem';
import { randomKey } from '@/utils/encoding';
import api from '@/api/brightId';
import {
  setBackupCompleted,
  setUserData,
  setConnections,
  setPassword,
  setGroups,
  setKeypair,
  updateConnections,
} from '@/actions';
import { fetchBackupData } from './backupThunks';
import {
  init,
  resetRecoverySigs,
  resetRecoveryData,
} from '../recoveryDataSlice';

// HELPERS

const THREE_DAYS = 259200000;

const pastLimit = (timestamp) => timestamp + THREE_DAYS < Date.now();

// THUNKS

export const setupRecovery = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    let { recoveryData } = getState();
    await createImageDirectory();
    // setup recovery data
    if (!recoveryData.timestamp || pastLimit(recoveryData.timestamp)) {
      const { publicKey, secretKey } = await nacl.sign.keyPair();
      const aesKey = await randomKey(16);

      // setup recovery data slice with new keypair
      dispatch(init({ publicKey, secretKey, aesKey }));
    }
  } catch (err) {
    // alert(err.message);
    console.error(`setupRecovery: ${err.message}`);
  }
};

export const setTrustedConnections = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const {
    connections: { trustedConnections },
  } = getState();
  await api.setTrusted(trustedConnections);
};

export const setSigningKey = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const { recoveryData } = getState();
  const sigs = Object.values(recoveryData.sigs);
  console.log('setting signing key');
  try {
    await api.setSigningKey({
      id: recoveryData.id,
      signingKey: recoveryData.publicKey,
      timestamp: recoveryData.timestamp,
      id1: sigs[0].signer,
      id2: sigs[1].signer,
      sig1: sigs[0].sig,
      sig2: sigs[1].sig,
    });
  } catch (err) {
    recoveryData.sigs = {};
    dispatch(resetRecoverySigs());
    throw new Error('bad sigs');
  }
};

export const restoreUserData = async (id: string, pass: string) => {
  const decrypted = await fetchBackupData('data', id, pass);

  const { userData, connections, groups = [] } = JSON.parse(decrypted);

  if (!userData || !connections) {
    throw new Error('bad password');
  }

  userData.id = id;

  const userPhoto = await fetchBackupData(id, id, pass);

  if (userPhoto) {
    const filename = await saveImage({
      imageName: id,
      base64Image: userPhoto,
    });
    userData.photo = { filename };
  }

  return { userData, connections, groups };
};

export const recoverData = (pass: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const { id, name, photo, publicKey, secretKey } = getState().recoveryData;

  // set new signing key on the backend
  await dispatch(setSigningKey());
  if (pass) {
    // throws if data is bad
    var { userData, connections, groups } = await restoreUserData(id, pass);
    dispatch(setConnections(connections));
    dispatch(setGroups(groups));
  } else {
    var userData = { id, publicKey, secretKey, name, photo };
    var connections = [];
    var groups = [];
  }
  dispatch(setKeypair(publicKey, secretKey));

  for (let conn of connections) {
    try {
      let decrypted = await fetchBackupData(conn.id, id, pass);
      const filename = await saveImage({
        imageName: conn.id,
        base64Image: decrypted,
      });
      conn.photo = { filename };
    } catch (err) {
      console.log('image not found', err.message);
      conn.photo = { filename: '' };
    }
  }

  for (const group of groups) {
    if (group.photo?.filename) {
      try {
        let decrypted = await fetchBackupData(group.id, id, pass);
        await saveImage({
          imageName: group.id,
          base64Image: decrypted,
        });
      } catch (err) {
        console.log('image not found', err.message);
      }
    }
  }
  const userInfo = await api.getUserInfo(id);
  dispatch(setGroups(userInfo.groups));
  dispatch(updateConnections(userInfo.connections));
  dispatch(setUserData(userData));
  dispatch(setBackupCompleted(pass !== ''));
  // password is required to update backup when user makes new connections
  dispatch(setPassword(pass));
  dispatch(resetRecoveryData());
  return true;
};
