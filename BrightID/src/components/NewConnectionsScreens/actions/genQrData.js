// @flow

import { randomBytes } from 'react-native-randombytes';
import uuidv4 from 'uuid/v4';
import { Alert } from 'react-native';
import server from '../../../Api/server'
import { b64ToUrlSafeB64 } from '../../../utils/encoding'
import { setConnectQrData } from '../../../actions';

export const genQrData = () => async (dispatch: () => null) => {

  const aesKey = randomBytes(16).toString('base64');
  const uuid = b64ToUrlSafeB64(randomBytes(9).toString('base64'));
  try {
    var ipAddress = await server.getIp();
    var b64Ip = Buffer.from(
      ipAddress.split('.').map(octet => parseInt(octet))
    ).toString('base64').substring(0, 6);
  } catch (e){
    Alert.alert(`Bad ip address (${ipAddress}) from server`, e.stack);
  }
  const qrString = `${aesKey}${uuid}${b64Ip}`;
  const user = '1';

  const dataObj = { aesKey, uuid, ipAddress, user, qrString };

  dispatch(setConnectQrData(dataObj));

};
