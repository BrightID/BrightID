// @flow

import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import { getGenericPassword } from 'react-native-keychain';
import { retrieveImage } from '@/utils/filesystem';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  b64ToUint8Array,
} from '@/utils/encoding';
import { postData } from './postData';

export const encryptAndUploadLocalData = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    const {
      user: {
        photo: { filename },
        name,
        score,
      },
      connectQrData: { aesKey },
      connectUserData,
    } = getState();
    let { username, password } = await getGenericPassword();
    let secretKey = b64ToUint8Array(password);
    // retrieve photo
    const photo = await retrieveImage(filename);

    let timestamp;
    let signedMessage;

    if (connectUserData.id && !connectUserData.signedMessage) {
      // The other user sent their id. Sign the message and send it.

      timestamp = Date.now();
      let message = `Add Connection${username}${connectUserData.id}${timestamp}`;
      signedMessage = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );
    }

    const dataObj = {
      id: username,
      // publicKey is added to make it compatible with earlier version
      publicKey: username,
      photo,
      name,
      score,
      signedMessage,
      timestamp,
    };

    const dataStr = JSON.stringify(dataObj);

    let encrypted = CryptoJS.AES.encrypt(dataStr, aesKey).toString();
    dispatch(postData(encrypted));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
