// @flow
import { getGenericPassword } from 'react-native-keychain';
import { b64ToUint8Array } from './encoding';

export const obtainKeys = async () => {
  try {
    let { username, password } = await getGenericPassword();
    if (!password) {
      alert('Secret Key is missing from device... please restore BrightID');
    }

    let secretKey = b64ToUint8Array(password);
    return { username, secretKey };
  } catch (err) {
    console.log(err.message);
    alert('Unable to access device keychain...');
  }
};
