// @flow
import {
  getGenericPassword,
  setGenericPassword,
  getSecurityLevel,
  STORAGE_TYPE,
} from 'react-native-keychain';
import { compose } from 'ramda';
import store from '@/store';
import { uInt8ArrayToB64, objToUint8, b64ToUint8Array } from './encoding';
import { DEVICE_ANDROID } from './constants';

const keyToString = compose(uInt8ArrayToB64, objToUint8);

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
    if (!secretKey) {
      alert(
        'Unable to access secret key, please reinstall app and recover BrightID',
      );
      return;
    }

    await saveSecretKey(id, keyToString(secretKey));

    return { username: id, secretKey: objToUint8(secretKey) };
  }
};

export const saveSecretKey = async (id: string, secretKey: string) => {
  try {
    if (DEVICE_ANDROID) {
      let opts = {};
      const SECURITY_LEVEL = await getSecurityLevel();
      opts.securityLevel = SECURITY_LEVEL;
      opts.storage = STORAGE_TYPE.AES;
      await setGenericPassword(id, secretKey, opts);
    } else {
      await setGenericPassword(id, secretKey);
    }
  } catch (err) {
    console.log('unable to save secret key', err.message);
  }
};
