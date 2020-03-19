// @flow

import api from '@/Api/BrightId';
import { getInviteInfo } from '@/utils/groups';
import { saveImage } from '@/utils/filesystem';

import {
  setGroups,
  setInvites,
  setUserScore,
  setVerifications,
  updateConnections,
  setIsSponsored,
} from './index';


const fetchUserInfo = () => async (dispatch: dispatch, getState: getState) => {
  const { id, operations, invites: oldInvites } = getState();
  console.log('refreshing user info', id);
  if (!id) return;
  try {
    const {
      invites,
      groups,
      score,
      verifications = [],
      connections = [],
      isSponsored,
    } = await api.getUserInfo(id);

    if (operations.length === 0) {
      // don't update data when there are pending operations
      dispatch(setGroups(groups));
    }
    dispatch(setUserScore(__DEV__ ? 100 : score));
    dispatch(setVerifications(verifications));
    dispatch(updateConnections(connections));
    dispatch(setIsSponsored(isSponsored));

    // this can not be done in reducer because it should be in an async function
    const pArray = invites.map(async (invite) => {
      const oldInvite = oldInvites.find(
        (inv) => inv.inviteId === invite.inviteId,
      );
      if (oldInvite) {
        oldInvite.members = invite.members;
        return oldInvite;
      } else {
        const info = await getInviteInfo(invite);
        let filename = null;
        if (info.photo) {
          filename = await saveImage({
            imageName: invite.id,
            base64Image: info.photo,
          });
        }
        return Object.assign(invite, {
          name: info.name,
          state: 'active',
          photo: { filename }
        });
      }
    });
    const newInvites = await Promise.all(pArray);
    dispatch(setInvites(newInvites));
  } catch (err) {
    console.log(err.message);
  }
};

export default fetchUserInfo;
