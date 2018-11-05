// @flow

import { randomBytes } from 'react-native-randombytes';
import nanoid from 'nanoid/non-secure';
import uuidv4 from 'uuid/v4';

const IP_ADDRESS = [40, 70, 26, 245];

export const qrData = () => () => {
  const uuid = uuidv4();
  const password = randomBytes(18).toString('base64');
  const ipAddress = Buffer.from(IP_ADDRESS).toString('base64');
<<<<<<< HEAD:BrightID/src/actions/genQrData.js
  const data = `${password};${uuid};${ipAddress}`;
  return data;
=======
  dispatch(parseQrData(`${password};${uuid};${ipAddress}`));
  return `${password};${uuid};${ipAddress}`;
>>>>>>> brightId/master:BrightID-rn/src/actions/genQrData.js
};
