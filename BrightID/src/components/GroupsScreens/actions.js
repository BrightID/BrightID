// @flow
import { Alert, NativeModules } from 'react-native';
import CryptoJS from 'crypto-js';
import { saveImage } from '@/utils/filesystem';
import { setNewGroupCoFounders, createGroup } from '../../actions/index';
import api from '../../Api/BrightId';
import backupApi from '../../Api/BackupApi';
import { hash } from '../../utils/encoding';
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
  let coFounders = [...getState().newGroupCoFounders];
  const index = coFounders.indexOf(id);
  if (index >= 0) {
    coFounders.splice(index, 1);
  } else if (coFounders.length < 2) {
    coFounders.push(id);
  }
  dispatch(setNewGroupCoFounders(coFounders));
};

export const createNewGroup = (photo, name, type) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    let { id, newGroupCoFounders, connections, backupCompleted } = getState();
    if (newGroupCoFounders.length < 2) {
      throw new Error('You need two other people to form a group');
    }

    const [founder1, founder2] = newGroupCoFounders.map((u) =>
      connections.find((c) => c.id === u),
    );

    if (type === 'primary') {
      if (founder1.hasPrimaryGroup || founder2.hasPrimaryGroup) {
        const name = founder1.hasPrimaryGroup ? founder1.name : founder2.name;
        throw new Error(`${name} already has a primary group`);
      }
    }

    const aesKey = await randomKey(16);
    let uuidKey = await randomKey(9);
    const groupId = hash(uuidKey);

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify({ name, photo }),
      aesKey,
    ).toString();

    // not sure if we should use the backup server for this...
    await backupApi.putRecovery('immutable', groupId, encrypted);

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

    const data1 = founder1.aesKey
      ? CryptoJS.AES.encrypt(aesKey, founder1.aesKey).toString()
      : '';

    const data2 = founder2.aesKey
      ? CryptoJS.AES.encrypt(aesKey, founder2.aesKey).toString()
      : '';

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
