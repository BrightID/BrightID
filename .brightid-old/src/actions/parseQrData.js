// @flow

import { setConnectQrData } from './index';
import { setUpWs } from './websocket';

export const parseQrData = ({
  data,
  user,
}: {
  data: string,
  user: number,
}) => async (dispatch: () => null) => {
  const dataList = data.split(';');
  const aesKey = dataList[0];
  const uuid = dataList[1];
  let ipAddress = [...Buffer.from(dataList[2], 'base64')].join('.');

  // for testing

  ipAddress = '127.0.0.1';

  const dataObj = { aesKey, uuid, ipAddress, user };

  dispatch(setConnectQrData(dataObj));
  dispatch(setUpWs());
};
