// @flow

import { randomBytes } from 'react-native-randombytes';
import nanoid from 'nanoid/non-secure';
import uuidv4 from 'uuid/v4';

const IP_ADDRESS = [40, 70, 26, 245];

export const qrData = () => (dispatch: () => null, getState: () => null) => {
  const { publicKey } = getState().main;
  // const uuid = nanoid(12);
  const uuid = uuidv4().slice(12);
  // const qrPublicKey = Object.values(publicKey).join();
  const qrPublicKey = Buffer.from(publicKey).toString('base64');
  const password = randomBytes(18).toString('base64');
  const ipAddress = Buffer.from(IP_ADDRESS).toString('base64');
  console.log(uuid);
  console.log(password);
  console.log(qrPublicKey);
  console.log(ipAddress);

  console.warn(`${password};${uuid};${ipAddress}`);
  return `${password};${uuid};${ipAddress}`;
};
