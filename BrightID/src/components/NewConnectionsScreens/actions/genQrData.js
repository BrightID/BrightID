// @flow

import { Buffer } from 'buffer';
import api from '@/api/node';
import { b64ToUrlSafeB64, randomKey } from '@/utils/encoding';
import { setConnectQrData } from '@/actions';

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
