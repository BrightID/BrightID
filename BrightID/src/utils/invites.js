// @flow

import CryptoJS from 'crypto-js';
import { eqProps } from 'ramda';
import store from '@/store';
import { saveImage } from './filesystem';
import { INVITE_ACTIVE } from './constants';

export const getInviteInfo = async (invite: invite) => {
  try {
    console.log('getting invite info', invite);
    const {
      connections: { connections },
    } = store.getState();
    const conn = connections.find((conn) => conn.id === invite.inviter);
    if (!conn.aesKey || !invite.data) {
      return {};
    }
    const groupAesKey = CryptoJS.AES.decrypt(invite.data, conn.aesKey).toString(
      CryptoJS.enc.Utf8,
    );

    if (!groupAesKey) {
      return {};
    }

    // const uuidKey = invite.url.split('/').pop();
    const res = await fetch(invite.url);
    const data = await res.text();

    if (!data) {
      return {};
    }

    let info = CryptoJS.AES.decrypt(data, groupAesKey).toString(
      CryptoJS.enc.Utf8,
    );

    info = JSON.parse(info);

    info.aesKey = groupAesKey;

    console.log('group info', info);
    return info;
  } catch (err) {
    console.log(`error in getting invite info ${err.message}`);
    return {};
  }
};

export const updateInvites = async (invites: invite[]): Promise<invite[]> => {
  try {
    const {
      groups: { invites: oldInvites = [] },
    } = store.getState();
    let newInvites = [];
    for (const invite of invites) {
      const oldInvite = oldInvites.find(eqProps('inviteId', invite));
      if (oldInvite && (oldInvite.name || !oldInvite.data)) {
        oldInvite.members = invite.members;
        newInvites.push(oldInvite);
      } else {
        let info = await getInviteInfo(invite);

        let filename = '';

        if (info.photo) {
          filename = await saveImage({
            imageName: invite.id,
            base64Image: info.photo,
          });
        }
        const newInv = Object.assign(invite, {
          name: info.name,
          state: INVITE_ACTIVE,
          photo: { filename },
          aesKey: info.aesKey,
        });
        newInvites.push(newInv);
      }
    }
    return newInvites;
  } catch (err) {
    console.log(`error in getting invite info ${err.message}`);
    return [];
  }
};
