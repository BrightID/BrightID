// @flow

import { randomBytes } from 'react-native-randombytes';
import { Alert } from 'react-native';
import api from '../../../Api/BrightIdApi';
import { b64ToUrlSafeB64 } from '../../../utils/encoding';
import { setConnectQrData } from '../../../actions';

export const genQrData = () => async (dispatch: dispatch) => {
  try {
    var ipAddress = await api.ip();
    try {
      const b64Ip = Buffer.from(
        ipAddress.split('.').map((octet) => parseInt(octet, 10)),
      )
        .toString('base64')
        .substring(0, 6);
      const aesKey = randomBytes(16).toString('base64');
      const uuid = b64ToUrlSafeB64(randomBytes(9).toString('base64'));
      const qrString = `${aesKey}${uuid}${b64Ip}`;
      const user = '1';

      const dataObj = { aesKey, uuid, ipAddress, user, qrString };

      dispatch(setConnectQrData(dataObj));
    } catch (e) {
      Alert.alert(e.message || 'Error', e.stack);
    }
  } catch (e) {
    Alert.alert(`Bad ip address (${ipAddress || ''}) from server ${api.baseUrl}`, e.stack);
  }
};
