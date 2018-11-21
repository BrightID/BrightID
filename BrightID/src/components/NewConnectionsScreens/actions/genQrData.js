// @flow

import { randomBytes } from 'react-native-randombytes';
import uuidv4 from 'uuid/v4';

const IP_ADDRESS = [40, 70, 26, 245];

export const qrData = () => () => {
  const uuid = uuidv4();
  const password = randomBytes(18).toString('base64');
  const ipAddress = Buffer.from(IP_ADDRESS).toString('base64');
  const data = `${password};${uuid};${ipAddress}`;
  return data;
};
