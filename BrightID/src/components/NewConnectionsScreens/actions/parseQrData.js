// @flow

import { setConnectQrData } from '../../../actions/index';
import { b64ToUint8Array } from '../../../utils/encoding';

export const parseQrData = (qrString: string) => (dispatch: dispatch) => {
  const aesKey = qrString.substr(0, 24);
  const uuid = qrString.substr(24, 12);
  const b64ip = `${qrString.substr(36, 6)}==`;
  const ipAddress = b64ToUint8Array(b64ip).join('.');

  const user = '2';
  const dataObj = { aesKey, uuid, ipAddress, user, qrString };

  dispatch(setConnectQrData(dataObj));
};
