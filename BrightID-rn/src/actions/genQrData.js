// @flow

import nanoid from 'nanoid/non-secure';

const IP_ADDRESS = '40.70.26.245';

export const qrData = () => (dispatch: () => null, getState: () => null) => {
  const { publicKey } = getState().main;
  const uuid = nanoid();
  const qrPublicKey = Object.values(publicKey).join();
  console.warn(publicKey.toString());
  console.warn(`${qrPublicKey};${uuid};${IP_ADDRESS}`);
  return `${qrPublicKey},${uuid},${IP_ADDRESS}`;
};
