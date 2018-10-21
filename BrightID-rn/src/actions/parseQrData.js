// @flow

import { setConnectQrData } from './index';

export const parseQrData = (data) => (
  dispatch: () => null,
  getState: () => null,
) => {
  const dataList = data.split(';');
  const aesKey = dataList[0];
  const uuid = dataList[1];
  const ipAddress = Buffer.from(dataList[2], 'base64');
  const dataObj = { aesKey, uuid, ipAddress };

  dispatch(setConnectQrData(dataObj));
  // const password = randomBytes(18).toString('base64');
  // const ipAddress = Buffer.from(IP_ADDRESS).toString('base64');
  // return `${password};${uuid};${ipAddress}`;
};
