// @flow

import { createDecipher } from 'react-native-crypto';
import {
  setConnectUserData,
  removeConnectUserData,
} from '../../../actions/index';
import emitter from '../../../emitter';

export const decryptData = (data: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    const { connectQrData } = getState();

    const { aesKey } = connectQrData;
    const decipher = createDecipher('aes128', aesKey);

    const decrypted =
      decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');

    const decryptedObj = JSON.parse(decrypted);

    dispatch(removeConnectUserData());
    dispatch(setConnectUserData(decryptedObj));
    emitter.emit('connectDataReady');
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
