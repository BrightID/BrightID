// @flow

import { setConnectQrData } from '../../../actions/index';

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
  const ipAddress = [...Buffer.from(dataList[2], 'base64')].join('.');

  const dataObj = { aesKey, uuid, ipAddress, user };

  dispatch(setConnectQrData(dataObj));
};
