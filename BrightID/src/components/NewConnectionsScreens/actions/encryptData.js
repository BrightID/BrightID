// @flow

import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import { retrieveImage } from '@/utils/filesystem';
import { strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import { oneTimeToken } from './notificationToken';

import { postData } from './postData';

export const encryptAndUploadProfile = (aesKey) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const {
    user: {
      id,
      photo: { filename },
      name,
      score,
    },
  } = getState();
  try {
    // retrieve photo
    const photo = await retrieveImage(filename);

    let timestamp;
    let signedMessage;

    const dataObj = {
      id,
      // publicKey is added to make it compatible with earlier version
      publicKey: id,
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
}

export const encryptAndUploadLocalData = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const {
    user: {
      id,
      secretKey,
      photo: { filename },
      name,
      score,
    },
    connectQrData: { aesKey },
    connectUserData,
  } = getState();
  try {
    // retrieve photo

    const photo = await retrieveImage(filename);

    let timestamp, signedMessage;

    if (connectUserData.id && !connectUserData.signedMessage) {
      // The other user sent their id. Sign the message and send it.

      timestamp = Date.now();
      const message = `Add Connection${id}${connectUserData.id}${timestamp}`;
      signedMessage = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );
    }

    const notificationToken = await oneTimeToken();

    const dataObj = {
      id,
      // publicKey is added to make it compatible with earlier version
      publicKey: id,
      photo,
      name,
      score,
      notificationToken,
      signedMessage,
      timestamp,
    };

    const dataStr = JSON.stringify(dataObj);

    let encrypted = CryptoJS.AES.encrypt(dataStr, aesKey).toString();
    // dispatch(postData(encrypted));
    dispatch(postData(encrypted));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
