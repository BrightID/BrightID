import nacl from 'tweetnacl';
import { setKeypair } from '@brightid/redux/actions';
import { createImageDirectory, saveImage } from '@/utils/filesystem';
import { hash, urlSafeRandomKey } from '@/utils/encoding';
import {
  addOperation,
  setConnections,
  setGroups,
  setUserData,
  upsertSig,
} from '@/actions';
import BrightidError, { OPERATION_APPLIED_BEFORE } from '@/api/brightidError';
import { NodeApi } from '@/api/brightId';
import fetchUserInfo from '@/actions/fetchUserInfo';
import { fetchBackupData } from './backupThunks';
import {
  init,
  resetRecoveryData,
  resetRecoverySigs,
  updateNamePhoto,
} from '../recoveryDataSlice';
import { verifyKeypair } from '@/utils/cryptoHelper';

// HELPERS

const THREE_DAYS = 259200000;

const pastLimit = (timestamp) => timestamp + THREE_DAYS < Date.now();

// THUNKS

export const setupRecovery =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    console.log(`Setting up recovery...`);
    const { recoveryData } = getState();
    await createImageDirectory();
    // setup recovery data
    if (!recoveryData.timestamp || pastLimit(recoveryData.timestamp)) {
      const { publicKey, secretKey } = await nacl.sign.keyPair();
      const aesKey = await urlSafeRandomKey(16);
      // setup recovery data slice with new keypair
      dispatch(init({ publicKey, secretKey, aesKey }));
    } else {
      // we should already have valid recovery data. double-check required data is available.
      const { publicKey, secretKey } = recoveryData;
      try {
        verifyKeypair({ publicKey, secretKey });
      } catch (e) {
        // Existing keys don't work, set up new keys.
        const { publicKey, secretKey } = await nacl.sign.keyPair();
        const aesKey = await urlSafeRandomKey(16);
        // setup recovery data slice with new keypair
        dispatch(init({ publicKey, secretKey, aesKey }));
      }
    }
  };

export const socialRecovery =
  (api: NodeApi): AppThunk<Promise<SubmittedOp | 'ALREADY APPLIED'>> =>
  async (dispatch: AppDispatch, getState) => {
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
      return op;
    } catch (err) {
      let errorString = '';
      if (err instanceof BrightidError) {
        if (err.errorNum === OPERATION_APPLIED_BEFORE) {
          console.log(
            `Social Recovery operation already applied. Ignoring this error.`,
          );
          return 'ALREADY APPLIED';
        }
        errorString = `${err.errorNum} - ${err.message}`;
      } else if (err instanceof Error) {
        errorString = `${err.name} - ${err.message}`;
      } else {
        errorString = `${err}`;
      }
      console.log(`Error in socialRecovery: ${errorString}`);
      dispatch(resetRecoverySigs());
      throw new Error(errorString);
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

export const setRecoveryKeys =
  (): AppThunk => (dispatch: AppDispatch, getState) => {
    const { publicKey, secretKey } = getState().recoveryData;
    verifyKeypair({ publicKey, secretKey });
    dispatch(setKeypair({ publicKey, secretKey }));
  };

export const recoverData =
  (
    pass: string,
    api: NodeApi,
    setTotalItems: (totalItems: number) => void,
    setCurrentItem: (currentItem: number) => void,
  ): AppThunk =>
  async (dispatch: AppDispatch, getState) => {
    const { id } = getState().recoveryData;
    console.log(`Starting recoverData for ${id}`);
    // throws if data is bad
    const restoredData = await restoreUserData(id, pass);
    console.log(`Got recovery data for ${id}`);
    const { userData } = restoredData;
    const { connections } = restoredData;
    const { groups } = restoredData;
    const apps = await api.getApps();
    const blindSigApps = apps.filter((app) => app.usingBlindSig);
    setTotalItems(connections.length + groups.length + blindSigApps.length);
    dispatch(setConnections(connections));
    dispatch(setGroups(groups));
    dispatch(updateNamePhoto({ name: userData.name, photo: userData.photo }));

    let currentItem = 1;

    // fetch connection images
    for (const conn of connections) {
      try {
        setCurrentItem(currentItem++);
        const decrypted = await fetchBackupData(conn.id, id, pass);
        const filename = await saveImage({
          imageName: conn.id,
          base64Image: decrypted,
        });
        conn.photo = { filename };
      } catch (err) {
        let errorString = '';
        if (err instanceof Error) {
          errorString = `${err.name} - ${err.message}`;
        } else {
          errorString = `${err}`;
        }
        console.log('Connection image not found', errorString);
        conn.photo = { filename: '' };
      }
    }

    // fetch group images
    for (const group of groups) {
      setCurrentItem(currentItem++);
      if (group?.photo?.filename) {
        try {
          const decrypted = await fetchBackupData(group.id, id, pass);
          await saveImage({
            imageName: group.id,
            base64Image: decrypted,
          });
        } catch (err) {
          let errorString = '';
          if (err instanceof Error) {
            errorString = `${err.name} - ${err.message}`;
          } else {
            errorString = `${err}`;
          }
          console.log('Group image not found', errorString);
        }
      }
    }

    // fetch blind sigs
    for (const app of blindSigApps) {
      setCurrentItem(currentItem++);
      for (const verification of app.verifications) {
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

export const finishRecovery =
  (): AppThunk => async (dispatch: AppDispatch, getState) => {
    // collect user data that was populated either by uploads from recovery connections or by restoring backup
    const { id, name, photo } = getState().recoveryData;
    // set the user data
    dispatch(setUserData({ id, name, photo }));
    // clear recovery data from state
    dispatch(resetRecoveryData());
  };
