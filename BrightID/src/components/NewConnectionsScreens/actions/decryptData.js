// @flow

import CryptoJS from 'crypto-js';
import { setConnectUserData, removeConnectUserData } from '@/actions';
import notificationService from '@/api/notificationService';
import emitter from '@/emitter';

export const decryptData = (data: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    const { connectQrData } = getState();

    const { aesKey } = connectQrData;

    const decrypted = CryptoJS.AES.decrypt(data, aesKey).toString(
      CryptoJS.enc.Utf8,
    );
    const decryptedObj = JSON.parse(decrypted);
    decryptedObj.aesKey = aesKey;

    notificationService.sendNotification({
      notificationToken: decryptedObj.notificationToken,
      type: 'CONNECTION_REQUEST',
    });

    dispatch(removeConnectUserData());
    dispatch(setConnectUserData(decryptedObj));
    emitter.emit('connectDataReady');
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
