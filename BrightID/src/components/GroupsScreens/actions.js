// @flow
import { Alert, NativeModules } from 'react-native';
import CryptoJS from 'crypto-js';
import { newGroupId } from '../../utils/groups';
import {
  setNewGroupCoFounders,
  createGroup,
} from '../../actions/index';
import api from '../../Api/BrightId';
import backupApi from '../../Api/BackupApi';
import { hash } from '../../utils/encoding';
import { saveImage } from '@/utils/filesystem';
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
  let { id, newGroupCoFounders, connections, backupCompleted } = getState();
  if (newGroupCoFounders.length < 2) {
    Alert.alert(
      'Cannot create group',
      'You need two other people to form a group',
    );
    return false;
  }

  const u1 = connections.find(c => c.id === newGroupCoFounders[0]);
  const u2 = connections.find(c => c.id === newGroupCoFounders[1]);
  if (type === 'primary') {
    if (u1.hasPrimaryGroup || u2.hasPrimaryGroup) {
      const name = u1.hasPrimaryGroup ? u1.name : u2.name;
      Alert.alert(
        'Cannot create group',
        `${name} already has a primary group`,
      );
      return false;
    }
  }

  const aesKey = await randomKey(16);
  let uuidKey = await randomKey(9);
  uuidKey = hash(uuidKey);
  const groupId = hash(uuidKey);

  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify({ name, photo }), aesKey).toString();
    await backupApi.putRecovery('immutable', uuidKey, encrypted);
    const url = `https://recovery.brightid.org/backups/immutable/${uuidKey}`;
    let filename = null;
    if (photo) {
      filename = await saveImage({
        imageName: groupId,
        base64Image: photo,
      });
    }
    const newGroup = {
      founders: [id, u1.id, u2.id],
      admins: [id, u1.id, u2.id],
      members: [id],
      id: groupId,
      isNew: true,
      score: 0,
      photo: { filename },
      name,
      url,
      aesKey,
      type
    };
    dispatch(createGroup(newGroup));
    const data1 = CryptoJS.AES.encrypt(aesKey, u1.aesKey).toString();
    const data2 = CryptoJS.AES.encrypt(aesKey, u2.aesKey).toString();
    await api.createGroup(groupId, u1.id, data1, u2.id, data2, url, type);
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
