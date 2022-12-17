import CryptoJS from 'crypto-js';
import { eqProps } from 'ramda';
import nacl from 'tweetnacl';
import { convertPublicKey, convertSecretKey } from 'ed2curve';
import { b64ToUint8Array, randomKey, uInt8ArrayToB64 } from '@/utils/encoding';
import { selectConnectionById } from '@/reducer/connectionsSlice';
import { saveImage } from './filesystem';
import { INVITE_ACTIVE } from './constants';
import { NodeApi } from '@/api/brightId';
import { userSelector } from '@/reducer/userSlice';

export const getInviteGroup =
  (api: NodeApi, inviteInfo: InviteInfo): AppThunk<Promise<any | undefined>> =>
  async (dispatch: AppDispatch, getState) => {
    try {
      console.log('getting invite group info', inviteInfo);

      const {
        keypair: { secretKey },
        groups: { groups },
      } = getState();

      const existingGroup = groups.find((g) => g.id === inviteInfo.group);
      if (
        existingGroup &&
        existingGroup.name &&
        existingGroup.aesKey &&
        existingGroup.aesKey !== ''
      ) {
        return existingGroup;
      }

      if (!inviteInfo.data) {
        return undefined;
      }

      const conn = selectConnectionById(getState(), inviteInfo.inviter);
      const { signingKeys } = await api.getProfile(conn.id);
      const pub = convertPublicKey(b64ToUint8Array(signingKeys[0]));
      const msg = b64ToUint8Array(inviteInfo.data.split('_')[0]);
      const nonce = b64ToUint8Array(inviteInfo.data.split('_')[1]);
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
      const group = await api.getGroup(inviteInfo.group);
      const res = await fetch(group.url);
      const data = await res.text();
      if (!data) {
        return undefined;
      }

      const infoString = CryptoJS.AES.decrypt(data, groupAesKey).toString(
        CryptoJS.enc.Utf8,
      );
      const info = JSON.parse(infoString);
      const groupObj = { ...info, ...group };
      let filename = '';
      if (groupObj.photo) {
        filename = await saveImage({
          imageName: groupObj.id,
          base64Image: groupObj.photo,
        });
      }
      groupObj.photo = { filename };
      groupObj.aesKey = groupAesKey;
      return groupObj;
    } catch (err) {
      console.log(`error in getting invite info ${err.message}`);
      return undefined;
    }
  };

export const getInvites =
  (api: NodeApi, oldInvites: Array<Invite>): AppThunk<Promise<Invite[]>> =>
  async (dispatch: AppDispatch, getState) => {
    const { id } = userSelector(getState());
    try {
      const inviteInfos = await api.getInvites(id);
      const invites: Array<Invite> = await Promise.all(
        inviteInfos.map(async (inviteInfo) => {
          const oldInvite = oldInvites.find(eqProps('id', inviteInfo));
          if (oldInvite && (oldInvite.group.name || !oldInvite.data)) {
            return {
              ...inviteInfo,
              group: oldInvite.group,
              state: oldInvite.state,
            };
          } else {
            return {
              ...inviteInfo,
              group: await dispatch(getInviteGroup(api, inviteInfo)),
              state: INVITE_ACTIVE,
            };
          }
        }),
      );
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
 * @param {Uint8Array} secretKey
 * @returns string
 */

export const encryptAesKey = async (
  aesKey: string,
  signingKey: string,
  secretKey: Uint8Array,
) => {
  try {
    const pub = convertPublicKey(b64ToUint8Array(signingKey));
    const msg = b64ToUint8Array(aesKey);
    const nonce = await randomKey(24);
    return `${uInt8ArrayToB64(
      nacl.box(msg, b64ToUint8Array(nonce), pub, convertSecretKey(secretKey)),
    )}_${nonce}`;
  } catch (err) {
    console.log(err.message);
    return '';
  }
};
