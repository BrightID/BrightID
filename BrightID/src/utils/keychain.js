// @flow
import {
  getGenericPassword,
  setGenericPassword,
  STORAGE_TYPE,
} from 'react-native-keychain';
import { compose } from 'ramda';
import store from '@/store';
import { uInt8ArrayToB64, objToUint8, b64ToUint8Array } from './encoding';
import { DEVICE_ANDROID } from './constants';

export const obtainKeys = async () => {
  try {
    let genericPassword = await getGenericPassword();
    if (!genericPassword) {
      throw new Error('secret key does not exist');
    }
    let { username, password } = genericPassword;
    let secretKey = b64ToUint8Array(password);
    if (secretKey.length < 10) {
      throw new Error('secret key does not exist');
    }
    return { username, secretKey };
  } catch (err) {
    console.log(err.message);
    let { id, secretKey } = store.getState().user;
    return { username: id, secretKey: b64ToUint8Array(secretKey) };
  }
};

export const saveSecretKey = async (id: string, secretKey: string) => {
  if (DEVICE_ANDROID) {
    let opts = { storage: STORAGE_TYPE.AES };
    await setGenericPassword(id, secretKey, opts);
  } else {
    await setGenericPassword(id, secretKey);
  }
};
