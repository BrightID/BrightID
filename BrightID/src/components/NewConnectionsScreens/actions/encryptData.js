// @flow

import { createCipher } from 'react-native-crypto';
import nacl from 'tweetnacl';
import { Alert } from 'react-native';
import { postData } from './postData';
import { retrieveImage } from '../../../utils/filesystem';
import { strToUint8Array, uInt8ArrayToB64 } from '../../../utils/encoding';

export const encryptAndUploadLocalData = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const {
    id,
    secretKey,
    photo: { filename },
    name,
    connectQrData: { aesKey },
    score,
    connectUserData,
  } = getState().main;

  // retrieve photo
  const photo = await retrieveImage(filename);

  let timestamp;
  let signedMessage;

  try {
    if (connectUserData.id && !connectUserData.signedMessage) {
      // The other user sent their id. Sign the message and send it.

      timestamp = Date.now();
      const message = 'Add Connection' + id + connectUserData.id + timestamp;
      signedMessage = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );
    }
  } catch (e) {
    Alert.alert(e.message || 'Error', e.stack);
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

  const cipher = createCipher('aes128', aesKey);

  let encrypted =
    cipher.update(dataStr, 'utf8', 'base64') + cipher.final('base64');
  console.log('encrypting data');
  dispatch(postData(encrypted));
};
