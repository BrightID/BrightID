// @flow

import { SET_CONNECT_QR_DATA, REMOVE_CONNECT_QR_DATA } from '@/actions';

export const initialState = {
  aesKey: '',
  ipAddress: '',
  uuid: '',
  user: '',
  qrString: '',
  channel: '',
};

export const reducer = (
  state: ConnectQrData = initialState,
  action: action,
) => {
  switch (action.type) {
    case SET_CONNECT_QR_DATA: {
      action.connectQrData.channel =
        action.connectQrData.uuid +
        (action.connectQrData.user === '1' ? '2' : '1');
      return {
        ...action.connectQrData,
      };
    }
    case REMOVE_CONNECT_QR_DATA: {
      return {
        aesKey: '',
        ipAddress: '',
        uuid: '',
        user: '',
        qrString: '',
        channel: '',
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
