import { Alert } from 'react-native';
import CryptoJS from 'crypto-js';
import i18next from 'i18next';
import emitter from '@/emitter';
import { saveImage } from '@/utils/filesystem';
import { encryptAesKey } from '@/utils/invites';
import { setNewGroupCoFounders, createGroup } from '@/actions/index';
import api from '@/api/brightId';
import backupApi from '@/api/backupService';
import { hash, randomKey } from '@/utils/encoding';
import {
  backupPhoto,
  backupUser,
} from '../Onboarding/RecoveryFlow/thunks/backupThunks';

export const toggleNewGroupCoFounder = (id) => (dispatch, getState) => {
  let coFounders = [...getState().groups.newGroupCoFounders];
  const index = coFounders.indexOf(id);
  if (index >= 0) {
    coFounders.splice(index, 1);
  } else if (coFounders.length < 2) {
    coFounders.push(id);
  }
  dispatch(setNewGroupCoFounders(coFounders));
};

export const createNewGroup = (photo, name, type) => async (
  dispatch,
  getState,
) => {
  try {
    let {
      user: { id, backupCompleted },
      groups: { newGroupCoFounders },
      connections: { connections },
    } = getState();
    if (newGroupCoFounders.length < 2) {
      throw new Error('You need two other people to form a group');
    }

    const [founder2, founder3] = newGroupCoFounders.map((u) =>
      connections.find((c) => c.id === u),
    );

    if (!founder2 || !founder3) return;

    if (type === 'primary') {
      if (founder2.hasPrimaryGroup || founder3.hasPrimaryGroup) {
        const name = founder2.hasPrimaryGroup ? founder2.name : founder3.name;
        throw new Error(`${name} already has a primary group`);
      }
    }

    const aesKey = await randomKey(16);
    const uuidKey = await randomKey(9);
    const groupId = hash(uuidKey);

    const groupData = JSON.stringify({ name, photo });

    const encryptedGroupData = CryptoJS.AES.encrypt(
      groupData,
      aesKey,
    ).toString();

    await backupApi.putRecovery('immutable', groupId, encryptedGroupData);
    emitter.emit('creatingGroupChannel', 'creatingGroup');

    const url = `https://recovery.brightid.org/backups/immutable/${groupId}`;

    let filename = null;
    if (photo) {
      filename = await saveImage({
        imageName: groupId,
        base64Image: photo,
      });
    }

    const newGroup = {
      founders: [id, founder2.id, founder3.id],
      admins: [id, founder2.id, founder3.id],
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

    const inviteData2 = await encryptAesKey(aesKey, founder2.signingKey);

    const inviteData3 = await encryptAesKey(aesKey, founder3.signingKey);

    await api.createGroup(
      groupId,
      founder2.id,
      inviteData2,
      founder3.id,
      inviteData3,
      url,
      type,
    );

    dispatch(createGroup(newGroup));

    if (backupCompleted) {
      await dispatch(backupUser());
      if (filename) {
        await dispatch(backupPhoto(groupId, filename));
      }
    }
    return true;
  } catch (err) {
    console.log(err.message);
    Alert.alert(i18next.t('createGroup.alert.title.createFailed'), err.message);
    return false;
  }
};
