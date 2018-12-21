// @flow

import { createDecipher } from 'react-native-crypto';
import {
  setConnectUserData,
  removeConnectUserData,
} from '../../../actions/index';
import emitter from '../../../emitter';
import { b64ToUint8Array } from '../../../utils/encoding';

export const decryptData = (data: string) => async (dispatch, getState) => {
  const { connectQrData } = getState().main;

  const { aesKey } = connectQrData;
  const decipher = createDecipher('aes128', aesKey);

  const decrypted =
    decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');

  const decryptedObj = JSON.parse(decrypted);

  decryptedObj.publicKey = b64ToUint8Array(decryptedObj.publicKey);

  dispatch(removeConnectUserData());
  dispatch(setConnectUserData(decryptedObj));
  emitter.emit('connectDataReady');
};
