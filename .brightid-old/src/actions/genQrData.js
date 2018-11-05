// @flow

import { randomBytes } from 'react-native-randombytes';
import uuidv4 from 'uuid/v4';
import { parseQrData } from './parseQrData';

const IP_ADDRESS = [40, 70, 26, 245];

export const qrData = () => (dispatch: () => null, getState: () => null) => {
  const uuid = uuidv4();
  // const qrPublicKey = Object.values(publicKey).join();
  const password = randomBytes(18).toString('base64');
  const ipAddress = Buffer.from(IP_ADDRESS).toString('base64');
  const data = `${password};${uuid};${ipAddress}`;
  dispatch(parseQrData({ data, user: 1 }));
  return data;
};
