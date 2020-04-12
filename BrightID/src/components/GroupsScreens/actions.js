// @flow

import { Alert, NativeModules } from 'react-native';
import CryptoJS from 'crypto-js';
import emitter from '@/emitter';
import { saveImage } from '@/utils/filesystem';
import { setNewGroupCoFounders, createGroup } from '@/actions/index';
import api from '@/Api/BrightId';
import backupApi from '@/Api/BackupApi';
import { hash, b64ToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import nacl from 'tweetnacl';
import { convertPublicKey, convertSecretKey } from 'ed2curve';
import { backupPhoto, backupUser } from '../Recovery/helpers';

const { RNRandomBytes } = NativeModules;

const randomKey = (size: number) =>
  new Promise((resolve, reject) => {
    RNRandomBytes.randomBytes(size, (err, bytes) => {
      err ? reject(err) : resolve(bytes);
    });
  });

export const toggleNewGroupCoFounder = (id: string) => (
  dispatch: dispatch,
  getState: getState,
) => {
  let coFounders = [...getState().groups.newGroupCoFounders];
  const index = coFounders.indexOf(id);
  if (index >= 0) {
    coFounders.splice(index, 1);
  } else if (coFounders.length < 2) {
    coFounders.push(id);
  }
  dispatch(setNewGroupCoFounders(coFounders));
};

export const createNewGroup = (
  photo: string,
  name: string,
  type: string,
) => async (dispatch: dispatch, getState: getState) => {
  try {
    let {
      user: { id, backupCompleted, secretKey },
      groups: { newGroupCoFounders },
      connections: { connections },
    } = getState();
    if (newGroupCoFounders.length < 2) {
      throw new Error('You need two other people to form a group');
    }

    const [founder1, founder2] = newGroupCoFounders.map((u) =>
      connections.find((c) => c.id === u),
    );

    if (!founder1 || !founder2) return;

    if (type === 'primary') {
      if (founder1.hasPrimaryGroup || founder2.hasPrimaryGroup) {
        const name = founder1.hasPrimaryGroup ? founder1.name : founder2.name;
        throw new Error(`${name} already has a primary group`);
      }
    }

    const aesKey = await randomKey(16);
    let uuidKey = await randomKey(9);
    const groupId = hash(uuidKey);

    const groupData = JSON.stringify({ name, photo });

    const encryptedGroupData = CryptoJS.AES.encrypt(
      groupData,
      aesKey,
    ).toString();

    await backupApi.putRecovery('immutable', groupId, encryptedGroupData);
    emitter.emit('creatingGroupChannel', 'creating the group');
    const url = `https://recovery.brightid.org/backups/immutable/${groupId}`;

    let filename = null;
    if (photo) {
      filename = await saveImage({
        imageName: groupId,
        base64Image: photo,
      });
    }

    const newGroup = {
      founders: [id, founder1.id, founder2.id],
      admins: [id, founder1.id, founder2.id],
      members: [id],
      id: groupId,
      isNew: true,
      score: 0,
      photo: { filename },
      name,
      url,
      aesKey,
      type,
    };

    const pub1 = convertPublicKey(b64ToUint8Array(founder1.signingKey));
    const pub2 = convertPublicKey(b64ToUint8Array(founder2.signingKey));
    const nonce = new Uint8Array(24);
    const msg = b64ToUint8Array(aesKey);
    const data1 = uInt8ArrayToB64(
      nacl.box(msg, nonce, pub1, convertSecretKey(secretKey)),
    );
    const data2 = uInt8ArrayToB64(
      nacl.box(msg, nonce, pub2, convertSecretKey(secretKey)),
    );

    await api.createGroup(
      groupId,
      founder1.id,
      data1,
      founder2.id,
      data2,
      url,
      type,
    );

    dispatch(createGroup(newGroup));

    if (backupCompleted) {
      await backupUser();
      if (filename) {
        await backupPhoto(groupId, filename);
      }
    }
    return true;
  } catch (err) {
    console.log(err);
    Alert.alert('Cannot create group', err.message);
    return false;
  }
};
