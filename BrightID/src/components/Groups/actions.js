import { Alert } from 'react-native';
import CryptoJS from 'crypto-js';
import i18next from 'i18next';
import emitter from '@/emitter';
import { saveImage } from '@/utils/filesystem';
import { encryptAesKey } from '@/utils/invites';
import { setNewGroupInvitees, createGroup } from '@/actions/index';
import backupApi from '@/api/backupService';
import { hash, randomKey } from '@/utils/encoding';
import { selectConnectionById } from '@/reducer/connectionsSlice';
import { addOperation } from '@/reducer/operationsSlice';
import {
  backupPhoto,
  backupUser,
} from '../Onboarding/RecoveryFlow/thunks/backupThunks';

export const toggleNewGroupInvitee = (id) => (dispatch, getState) => {
  let invitees = [...getState().groups.newGroupInvitees];
  const index = invitees.indexOf(id);
  if (index >= 0) {
    invitees.splice(index, 1);
  } else {
    invitees.push(id);
  }
  dispatch(setNewGroupInvitees(invitees));
};

export const createNewGroup = (photo, name, type, api) => async (
  dispatch,
  getState,
) => {
  try {
    let {
      user: { id, backupCompleted },
      groups: { newGroupInvitees },
    } = getState();

    const invitees = newGroupInvitees.map(
      (inv) => selectConnectionById(getState(), inv)
    );

    if (type === 'primary') {
      invitees.forEach((inv) => {
        if (inv.hasPrimaryGroup) {
          throw new Error(`${inv.name} already has a primary group`);
        }
      });
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
      admins: [id],
      members: [id],
      id: groupId,
      photo: { filename },
      name,
      url,
      aesKey,
      type,
      state: 'initiated'
    };

    let op = await api.createGroup(
      groupId,
      url,
      type,
    );
    dispatch(addOperation(op));
    dispatch(createGroup(newGroup));

    for (const inv of invitees) {
      const { signingKeys } = await api.getProfile(inv.id);
      const inviteData = await encryptAesKey(aesKey, signingKeys[0]);
      op = await api.invite(inv.id, groupId, inviteData);
      dispatch(addOperation(op));
    }

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
