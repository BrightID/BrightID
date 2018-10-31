// @flow

import { setConnectQrData } from './index';

export const parseQrData = ({
  data,
  user,
}: {
  data: string,
  user: number,
}) => async (dispatch: () => null, getState: () => null) => {
  const dataList = data.split(';');
  const aesKey = dataList[0];
  const uuid = dataList[1];
  const ipAddress = [...Buffer.from(dataList[2], 'base64')].join('.');
  console.log(ipAddress);
  console.log(uuid);
  const dataObj = { aesKey, uuid, ipAddress, user };

  dispatch(setConnectQrData(dataObj));
};
