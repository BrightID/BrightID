// @flow

import { setConnectQrData } from '../../../actions/index';

export const parseQrData = (qrString): string => async (dispatch: () => null) => {
  const aesKey = qrString.substr(0,32);
  const uuid = qrString.substr(32, 12);
  const ipAddress = [...Buffer.from(qrString.substr(44, 8), 'base64')].join('.');

  const user = '2';
  const dataObj = { aesKey, uuid, ipAddress, user, qrString };

  dispatch(setConnectQrData(dataObj));
};
