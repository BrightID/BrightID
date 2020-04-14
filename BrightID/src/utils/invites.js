// @flow

import CryptoJS from 'crypto-js';
import { eqProps } from 'ramda';
import store from '@/store';
import { uInt8ArrayToB64, b64ToUint8Array, randomKey } from '@/utils/encoding';
import nacl from 'tweetnacl';
import { convertPublicKey, convertSecretKey } from 'ed2curve';
import { saveImage } from './filesystem';
import { INVITE_ACTIVE } from './constants';

export const getInviteInfo = async (invite: invite) => {
  try {
    console.log('getting invite info', invite);
    const {
      user: { secretKey },
      connections: { connections },
    } = store.getState();
    const conn = connections.find((conn) => conn.id === invite.inviter);
    if (!invite.data) {
      return {};
    }
    const pub = convertPublicKey(b64ToUint8Array(conn.signingKey));
    const msg = b64ToUint8Array(invite.data.split('_')[0]);
    const nonce = b64ToUint8Array(invite.data.split('_')[1]);
    const groupAesKey = uInt8ArrayToB64(
      nacl.box.open(msg, nonce, pub, convertSecretKey(secretKey)),
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

export const encryptAesKey = async (aesKey: string, signingKey: string) => {
  try {
    const {
      user: { secretKey },
    } = store.getState();

    const pub = convertPublicKey(b64ToUint8Array(signingKey));
    const msg = b64ToUint8Array(aesKey);
    const nonce = await randomKey(24);
    const data = `${uInt8ArrayToB64(
      nacl.box(msg, b64ToUint8Array(nonce), pub, convertSecretKey(secretKey)),
    )}_${nonce}`;
    return data;
  } catch (err) {
    console.log(err.message);
    return '';
  }
};
