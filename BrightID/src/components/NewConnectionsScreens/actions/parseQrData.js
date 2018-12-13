// @flow

import { setConnectQrData } from '../../../actions/index';

export const parseQrData = (qrString): string => async (dispatch: () => null) => {
  const aesKey = qrString.substr(0,24);
  const uuid = qrString.substr(24, 12);
  const ipAddress = [...Buffer.from(qrString.substr(36, 8), 'base64')].join('.');

  const user = '2';
  const dataObj = { aesKey, uuid, ipAddress, user, qrString };

  dispatch(setConnectQrData(dataObj));
};
