// @flow

import CryptoJS from 'crypto-js';
import { eqProps } from 'ramda';
import store from '@/store';
import { saveImage } from './filesystem';
import { INVITE_ACTIVE } from './constants';

export const getInviteInfo = async (invite: invite) => {
  console.log('getting invite info', invite);
  const { connections } = store.getState();
  const conn = connections.find((conn) => conn.id === invite.inviter);
  if (!conn.aesKey) {
    return {};
  }
  const groupAesKey = CryptoJS.AES.decrypt(invite.data, conn.aesKey).toString(
    CryptoJS.enc.Utf8,
  );
  // const uuidKey = invite.url.split('/').pop();
  const res = await fetch(invite.url);
  const data = await res.text();
  let info = CryptoJS.AES.decrypt(data, groupAesKey).toString(
    CryptoJS.enc.Utf8,
  );
  info = JSON.parse(info);
  console.log('group info', info);
  return info;
};

export const updateInvites = async (invites: invite[]): Promise<invite[]> => {
  const { invites: oldInvites = [] } = store.getState();
  let newInvites = [];
  for (const invite of invites) {
    const oldInvite = oldInvites.find(eqProps('inviteId', invite));
    if (oldInvite) {
      oldInvite.members = invite.members;
      newInvites.push(oldInvite);
    } else {
      try {
        const info = await getInviteInfo(invite);
      } catch (err) {
        console.log('error in getting invite info' + err instanceof Error ? err.message : err);
        continue;
      }
      let filename = '';
      if (info?.photo) {
        filename = await saveImage({
          imageName: invite.id,
          base64Image: info?.photo,
        });
      }
      const newInv = Object.assign(invite, {
        name: info?.name,
        state: INVITE_ACTIVE,
        photo: { filename },
      });
      newInvites.push(newInv);
    }
  }
  return newInvites;
};
