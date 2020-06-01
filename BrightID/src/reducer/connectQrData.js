// @flow

import { SET_CONNECT_QR_DATA, REMOVE_CONNECT_QR_DATA } from '@/actions';
import { CLEAR_MY_QR_DATA, SET_MY_QR_DATA } from '../actions/connectQrData';

export const initialState = {
  myQrData: undefined,
  // TODO - enable storing data of multiple peers
  peerQrData: {
    aesKey: '',
    ipAddress: '',
    uuid: '',
    qrString: '',
    channel: '',
    user: '',
    type: '',
  },
};

export const reducer = (
  state: ConnectQrData = initialState,
  action: action,
) => {
  switch (action.type) {
    case SET_CONNECT_QR_DATA: {
      action.connectQrData.channel = action.connectQrData.uuid;
      return {
        ...state,
        peerQrData: action.connectQrData,
      };
    }
    case REMOVE_CONNECT_QR_DATA: {
      return {
        ...state,
        peerQrData: initialState.peerQrData,
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
