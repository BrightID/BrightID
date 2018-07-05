// moved from store/index
// these functions are written as redux-thunk actions

import nacl from 'tweetnacl';
import { setPPKeys } from '../actions/index';

export const setupPPKeys = (ppKeys) => async (dispatch) => {
  try {
    if (
      ppKeys.hasOwnProperty('publicKey') &&
      ppKeys.hasOwnProperty('privateKey')
    ) {
      dispatch(setPPKeys({ connectionPPKeys: ppKeys }));
    }
  } catch (err) {
    console.warn(err);
  }
};

export const generatePPKeys = () => async (dispatch) => {
  try {
    dispatch(setPPKeys({ connectionPKeys: nacl.sign.keyPair() }));
  } catch (err) {
    console.warn(err);
  }
};
