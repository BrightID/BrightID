import nacl from 'tweetnacl';
import { createImageDirectory, saveImage } from '@/utils/filesystem';
import { hash, randomKey } from '@/utils/encoding';
import {
  setUserData,
  setConnections,
  setGroups,
  setKeypair,
  addOperation,
  upsertSig,
} from '@/actions';
import { OPERATION_APPLIED_BEFORE } from '@/api/brightidError';
import { NodeApi } from '@/api/brightId';
import fetchUserInfo from '@/actions/fetchUserInfo';
import { fetchBackupData } from './backupThunks';
import {
  init,
  resetRecoveryData,
  resetRecoverySigs,
  updateNamePhoto,
} from '../recoveryDataSlice';

// HELPERS

const THREE_DAYS = 259200000;

const pastLimit = (timestamp) => timestamp + THREE_DAYS < Date.now();

// THUNKS

export const setupRecovery = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const { recoveryData } = getState();
  await createImageDirectory();
  // setup recovery data
  if (!recoveryData.timestamp || pastLimit(recoveryData.timestamp)) {
    const { publicKey, secretKey } = await nacl.sign.keyPair();
    const aesKey = await randomKey(16);
    // setup recovery data slice with new keypair
    dispatch(init({ publicKey, secretKey, aesKey }));
  }
};

export const socialRecovery = (api: NodeApi) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const { recoveryData } = getState();
  const sigs = Object.values(recoveryData.sigs);
  console.log('setting signing key');
  try {
    const op = await api.socialRecovery({
      id: recoveryData.id,
      signingKey: recoveryData.publicKey,
      timestamp: recoveryData.timestamp,
      id1: sigs[0].signer,
      id2: sigs[1].signer,
      sig1: sigs[0].sig,
      sig2: sigs[1].sig,
    });
    dispatch(addOperation(op));
    return op.hash;
  } catch (err) {
    if (err.errorNum === OPERATION_APPLIED_BEFORE) {
      console.log(
        `Social Recovery operation already applied. Ignoring this error.`,
      );
      return;
    }
    console.log(`Error in socialRecovery: ${err.errorNum} - ${err.message}`);
    dispatch(resetRecoverySigs());
    throw new Error(`${err.errorNum} - ${err.message}`);
  }
};

export const restoreUserData = async (id: string, pass: string) => {
  const decrypted = await fetchBackupData('data', id, pass);
  const { userData, connections, groups = [] } = JSON.parse(decrypted);
  if (!userData || !connections) {
    // TODO Better error handling
    throw new Error('bad password');
  }

  let userPhoto;
  try {
    userPhoto = await fetchBackupData(id, id, pass);
  } catch (e) {
    console.log(`Failed to recover user photo`);
    // ignore this error and try to continue recovery process
  }

  if (userPhoto) {
    const filename = await saveImage({
      imageName: id,
      base64Image: userPhoto,
    });
    userData.photo = { filename };
  }

  return { userData, connections, groups };
};

export const setRecoveryKeys = () => (
  dispatch: dispatch,
  getState: getState,
) => {
  const { publicKey, secretKey } = getState().recoveryData;
  dispatch(setKeypair({ publicKey, secretKey }));
};

export const recoverData = (pass: string, api: NodeApi) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const { id } = getState().recoveryData;
  console.log(`Starting recoverData for ${id}`);
  // throws if data is bad
  const restoredData = await restoreUserData(id, pass);
  console.log(`Got recovery data for ${id}`);
  const { userData } = restoredData;
  const { connections } = restoredData;
  const { groups } = restoredData;
  dispatch(setConnections(connections));
  dispatch(setGroups(groups));
  dispatch(updateNamePhoto({ name: userData.name, photo: userData.photo }));

  // fetch connection images
  for (const conn of connections) {
    try {
      const decrypted = await fetchBackupData(conn.id, id, pass);
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

  // fetch group images
  for (const group of groups) {
    if (group.photo?.filename) {
      try {
        const decrypted = await fetchBackupData(group.id, id, pass);
        await saveImage({
          imageName: group.id,
          base64Image: decrypted,
        });
      } catch (err) {
        console.log('image not found', err.message);
      }
    }
  }

  // fetch blind sigs
  console.log('fetching blind sigs ...');
  const apps = await api.getApps();
  const blindSigApps = apps.filter((app) => app.usingBlindSig);
  for (const app of blindSigApps) {
    for (const verification of app.verifications) {
      console.log(app.id, 'apppppppps');
      const vel = app.verificationExpirationLength;
      const roundedTimestamp = vel ? Math.floor(Date.now() / vel) * vel : 0;
      const key = hash(`${app.id} ${verification} ${roundedTimestamp}`);
      try {
        const decrypted = await fetchBackupData(key, id, pass);
        await dispatch(upsertSig(JSON.parse(decrypted)));
      } catch (err) {
        console.log(`blind sig not found for ${key}`, err.message);
      }
    }
  }

  dispatch(fetchUserInfo(api));
};

export const finishRecovery = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  // collect user data that was populated either by uploads from recovery connections or by restoring backup
  const { id, name, photo } = getState().recoveryData;
  // clear recovery data from state
  dispatch(resetRecoveryData());
  // finally set the user data
  dispatch(setUserData({ id, name, photo }));
};
