// @flow

export const SET_KEYPAIR = 'SET_KEYPAIR';

export const setKeypair = (publicKey, secretKey) => ({
  type: SET_KEYPAIR,
  publicKey,
  secretKey,
});
