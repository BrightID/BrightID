// @flow

import { SET_CONNECT_QR_DATA, REMOVE_CONNECT_QR_DATA } from '@/actions';
import { CLEAR_MY_QR_DATA, SET_MY_QR_DATA } from '../actions/connectQrData';

export const initialState = {
  myQrData: undefined,
  // TODO - enable storing of multiple other data
  otherCodeData: {
    aesKey: '',
    ipAddress: '',
    uuid: '',
    qrString: '',
    channel: '',
    user: '',
  },
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
        ...state,
        otherCodeData: action.connectQrData,
      };
    }
    case REMOVE_CONNECT_QR_DATA: {
      return {
        ...state,
        otherCodeData: initialState.otherCodeData,
      };
    }
    case SET_MY_QR_DATA: {
      action.myQrData.channel = action.myQrData.uuid;
      return {
        ...state,
        myQrData: action.myQrData,
      };
    }
    case CLEAR_MY_QR_DATA: {
      return {
        ...state,
        myQrData: initialState.myQrData,
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
