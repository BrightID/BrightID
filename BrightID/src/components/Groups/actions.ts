import { Alert } from 'react-native';
import CryptoJS from 'crypto-js';
import i18next from 'i18next';
import { saveImage } from '@/utils/filesystem';
import { encryptAesKey } from '@/utils/invites';
import { createGroup } from '@/actions/index';
import backupApi from '@/api/backupService';
import { hash, randomKey } from '@/utils/encoding';
import { selectConnectionById } from '@/reducer/connectionsSlice';
import { addOperation } from '@/reducer/operationsSlice';
import {
  backupPhoto,
  syncAndBackupUser,
} from '../Onboarding/RecoveryFlow/thunks/backupThunks';
import { NodeApi } from '@/api/brightId';
import { group_states } from '@/utils/constants';

export const createNewGroup =
  (
    photo: string,
    name: string,
    api: NodeApi,
    newGroupInvitees: Array<string>,
    setCreationState: (string) => void,
  ): AppThunk<Promise<boolean>> =>
  async (dispatch: AppDispatch, getState) => {
    try {
      const {
        user: { id, backupCompleted },
        keypair: { secretKey },
      } = getState();

      const invitees = newGroupInvitees.map((inv) =>
        selectConnectionById(getState(), inv),
      );

      const aesKey = await randomKey(16);
      const uuidKey = await randomKey(9);
      const groupId = hash(uuidKey);
      const type = 'general';

      const groupData = JSON.stringify({ name, photo });

      const encryptedGroupData = CryptoJS.AES.encrypt(
        groupData,
        aesKey,
      ).toString();

      await backupApi.putRecovery('immutable', groupId, encryptedGroupData);
      setCreationState('creatingGroup');

      const url = `https://recovery.brightid.org/backups/immutable/${groupId}`;

      let filename = null;
      if (photo) {
        filename = await saveImage({
          imageName: groupId,
          base64Image: photo,
        });
      }

      const newGroup: JoinedGroup = {
        invites: [],
        joined: 0,
        timestamp: 0,
        admins: [id],
        members: [id],
        id: groupId,
        photo: { filename },
        name,
        url,
        aesKey,
        type,
        state: group_states.INITIATED,
      };

      const createOp = await api.createGroup(groupId, url, type);
      dispatch(addOperation(createOp));
      dispatch(createGroup(newGroup));

      for (const inv of invitees) {
        const { signingKeys } = await api.getProfile(inv.id);
        const inviteData = await encryptAesKey(
          aesKey,
          signingKeys[0],
          secretKey,
        );
        const inviteOp = await api.invite(inv.id, groupId, inviteData);
        dispatch(addOperation(inviteOp));
      }

      if (backupCompleted) {
        await dispatch(syncAndBackupUser());
        if (filename) {
          await dispatch(backupPhoto(groupId, filename));
        }
      }
      return true;
    } catch (err) {
      console.error(err.message);
      Alert.alert(
        i18next.t('createGroup.alert.title.createFailed'),
        err.message,
      );
      return false;
    }
  };
