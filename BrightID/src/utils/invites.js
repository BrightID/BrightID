import CryptoJS from 'crypto-js';
import { eqProps } from 'ramda';
import nacl from 'tweetnacl';
import { convertPublicKey, convertSecretKey } from 'ed2curve';
import store from '@/store';
import { uInt8ArrayToB64, b64ToUint8Array, randomKey } from '@/utils/encoding';
import { selectConnectionById } from '@/reducer/connectionsSlice';
import { saveImage } from './filesystem';
import { INVITE_ACTIVE } from './constants';

/**
 *
 * @param {invite} invite
 * @type invite
 * @returns
 */
export const getInviteGroup = async (invite, api) => {
  try {
    console.log('getting invite group info', invite);

    let {
      keypair: { secretKey },
      groups: { groups },
    } = store.getState();

    const existingGroup = groups.find((g) => g.id === invite.group);
    if (
      existingGroup &&
      existingGroup.name &&
      existingGroup.aesKey &&
      existingGroup.aesKey !== ''
    ) {
      return existingGroup;
    }

    if (!invite.data) {
      return undefined;
    }

    const conn = selectConnectionById(store.getState(), invite.inviter);
    const { signingKeys } = await api.getProfile(conn.id);
    const pub = convertPublicKey(b64ToUint8Array(signingKeys[0]));
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
      return undefined;
    }
    const groupAesKey = uInt8ArrayToB64(decryptedMessage);
    if (!groupAesKey) {
      return undefined;
    }

    // const uuidKey = invite.url.split('/').pop();
    let group = await api.getGroup(invite.group);
    const res = await fetch(group.url);
    const data = await res.text();
    if (!data) {
      return undefined;
    }

    let info = CryptoJS.AES.decrypt(data, groupAesKey).toString(
      CryptoJS.enc.Utf8,
    );
    info = JSON.parse(info);
    group = { ...info, ...group };
    let filename = '';
    if (group.photo) {
      filename = await saveImage({
        imageName: group.id,
        base64Image: group.photo,
      });
    }
    group.photo = { filename };
    group.aesKey = groupAesKey;
    return group;
  } catch (err) {
    console.log(`error in getting invite info ${err.message}`);
    return undefined;
  }
};

/**
 *
 * @param {invite[]} invites
 * @returns
 */
export const getInvites = async (api) => {
  try {
    const {
      user: { id },
      groups: { invites: oldInvites = [] },
    } = store.getState();
    const invites = await api.getInvites(id);
    for (const invite of invites) {
      const oldInvite = oldInvites.find(eqProps('id', invite));
      if (oldInvite && (oldInvite.group.name || !oldInvite.data)) {
        invite.group = oldInvite.group;
        invite.state = oldInvite.state;
      } else {
        invite.group = await getInviteGroup(invite, api);
        invite.state = INVITE_ACTIVE;
      }
    }
    // exclude invites where group could not be determined
    return invites.filter((invite) => invite.group);
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
