// @flow

export const SET_CONNECT_QR_DATA = 'SET_CONNECT_QR_DATA';
export const REMOVE_CONNECT_QR_DATA = 'REMOVE_CONNECT_QR_DATA';
export const SET_MY_QR_DATA = 'SET_MY_QR_DATA';
export const CLEAR_MY_QR_DATA = 'CLEAR_MY_QR_DATA';

export const setConnectQrData = (connectQrData: {
  ipAddress: string,
  aesKey: string,
  uuid: string,
}) => ({
  type: SET_CONNECT_QR_DATA,
  connectQrData,
});

export const removeConnectQrData = () => ({
  type: REMOVE_CONNECT_QR_DATA,
});

export const setMyQrData = (myQrData: {
  ipAddress: string,
  aesKey: string,
  uuid: string,
  timestamp: number,
  ttl: number,
  qrString: string,
}) => ({
  type: SET_MY_QR_DATA,
  myQrData,
});

export const clearMyQrData = () => ({
  type: CLEAR_MY_QR_DATA,
});
