// @flow

import { NativeModules } from 'react-native';
import { Buffer } from 'buffer';
import api from '../../../Api/BrightId';
import { b64ToUrlSafeB64 } from '../../../utils/encoding';
import { setConnectQrData } from '../../../actions';

const { RNRandomBytes } = NativeModules;

const randomKey = (size: number) =>
  new Promise((resolve, reject) => {
    RNRandomBytes.randomBytes(size, (err, bytes) => {
      err ? reject(err) : resolve(bytes);
    });
  });

export const genQrData = () => async (dispatch: dispatch) => {
  try {
    var ipAddress = await api.ip();

    const b64Ip = Buffer.from(
      ipAddress.split('.').map((octet) => parseInt(octet, 10)),
    )
      .toString('base64')
      .substring(0, 6);
    const aesKey = await randomKey(16);
    const uuidKey = await randomKey(9);
    const uuid = b64ToUrlSafeB64(uuidKey);
    const qrString = `${aesKey}${uuid}${b64Ip}`;
    const user = '1';

    const dataObj = { aesKey, uuid, ipAddress, user, qrString };

    dispatch(setConnectQrData(dataObj));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
