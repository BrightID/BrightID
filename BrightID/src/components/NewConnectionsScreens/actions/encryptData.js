// @flow

import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import { postData } from './postData';
import { retrieveImage } from '../../../utils/filesystem';
import { strToUint8Array, uInt8ArrayToB64 } from '../../../utils/encoding';

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

    let timestamp;
    let signedMessage;

    if (connectUserData.id && !connectUserData.signedMessage) {
      // The other user sent their id. Sign the message and send it.

      timestamp = Date.now();
      const message = `Add Connection${id}${connectUserData.id}${timestamp}`;
      signedMessage = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );
    }

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
};
