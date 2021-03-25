import CryptoJS from 'crypto-js';
import { eqProps } from 'ramda';
import store from '@/store';
import { uInt8ArrayToB64, b64ToUint8Array, randomKey } from '@/utils/encoding';
import nacl from 'tweetnacl';
import { convertPublicKey, convertSecretKey } from 'ed2curve';
import { selectConnectionById } from '@/reducer/connectionsSlice';
import { saveImage } from './filesystem';
import { INVITE_ACTIVE } from './constants';

/**
 *
 * @param {invite} invite
 * @type invite
 * @returns
 */
export const getInviteInfo = async (invite) => {
  try {
    console.log('getting invite info', invite);
    if (!invite.data) {
      return {};
    }

    let { secretKey } = store.getState().keypair;

    const conn = selectConnectionById(store.getState(), invite.inviter);

    const pub = convertPublicKey(b64ToUint8Array(conn.signingKey));
    const msg = b64ToUint8Array(invite.data.split('_')[0]);
    const nonce = b64ToUint8Array(invite.data.split('_')[1]);
    const decryptedMessage = nacl.box.open(
      msg,
      nonce,
      pub,
      convertSecretKey(secretKey),
    );

    if (!decryptedMessage) {
      // can happen if the user recovered his account after the invitation was created
      return {};
    }
    const groupAesKey = uInt8ArrayToB64(decryptedMessage);

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

/**
 *
 * @param {invite[]} invites
 * @returns
 */
export const updateInvites = async (invites) => {
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

/**
 *
 * @param {string} aesKey
 * @param {string} signingKey
 * @returns string
 */

export const encryptAesKey = async (aesKey, signingKey) => {
  try {
    let { secretKey } = store.getState().keypair;

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
