// @flow
import {
  getGenericPassword,
  getInternetCredentials,
} from 'react-native-keychain';
import { b64ToUint8Array } from './encoding';

export const obtainKeys = async () => {
  try {
    let { username, password } = await getGenericPassword();
    if (!password || !username) {
      throw new Error('secret key does not exist');
    }

    let secretKey = b64ToUint8Array(password);
    if (secretKey.length < 10) {
      throw new Error('secret key does not exist');
    }

    return { username, secretKey };
  } catch (err) {
    console.log(err.message);
    let { username, secretKey } = await obtainSecondaryKeys();
    return { username, secretKey };
  }
};

const obtainSecondaryKeys = async () => {
  try {
    let { username, password } = await getInternetCredentials('secretKey');
    if (!password) {
      alert('Secret Key is missing from device... please restore BrightID');
    }

    let secretKey = b64ToUint8Array(password);
    if (secretKey.length < 10) {
      alert('Secret Key is missing from device... please restore BrightID');
    }
    return { username, secretKey };
  } catch (err) {
    console.log(err.message);
    alert('Unable to access device keychain...');
    return { username: '', secretKey: [] };
  }
};
