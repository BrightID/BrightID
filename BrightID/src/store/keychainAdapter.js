// @flow

import {
  SECURITY_RULES,
  getGenericPassword,
  setGenericPassword,
  resetGenericPassword,
} from 'react-native-keychain';
import AsyncStorage from '@react-native-community/async-storage';
import { DEVICE_ANDROID } from '@/utils/constants';
import { b64ToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';

const getItem = async (key: string) => {
  console.log('keypair get item', key);
  try {
    let { username, password } = await getGenericPassword();

    if (!password) {
      throw new Error(`keypair does not exist in keychain!`);
    }

    return { publicKey: username, secretKey: b64ToUint8Array(password) };
  } catch (err) {
    let data = await AsyncStorage.getItem(key);
    if (data) {
      console.error(`react-native-keychain is not accessible`);
      let { publicKey, secretKey } = JSON.parse(data);
      secretKey = b64ToUint8Array(secretKey);
      return { publicKey, secretKey };
    } else {
      throw err;
    }
  }
};

const setItem = async (
  key: string,
  keypair: { publicKey: string, secretKey: Uint8Array },
) => {
  let b64SecretKey = uInt8ArrayToB64(keypair.secretKey);
  try {
    if (DEVICE_ANDROID) {
      let opts = { rules: SECURITY_RULES.NONE };
      await setGenericPassword(keypair.publicKey, b64SecretKey, opts);
    } else {
      await setGenericPassword(keypair.publicKey, b64SecretKey);
    }
    // we can remove this later once we have better metrics for react-native-keychain
    await AsyncStorage.setItem(
      'keypair',
      JSON.stringify({ publicKey: keypair.publicKey, secretKey: b64SecretKey }),
    );
  } catch (err) {
    console.error(err.message);
    await AsyncStorage.setItem(
      'keypair',
      JSON.stringify({ publicKey: keypair.publicKey, secretKey: b64SecretKey }),
    );
  }
};

const removeItem = async () => {
  try {
    await resetGenericPassword();
    await AsyncStorage.removeItem('keypair');
  } catch (err) {
    console.error(err.message);
    await AsyncStorage.removeItem('keypair');
  }
};

const KeychainStorage = {
  getItem,
  setItem,
  removeItem,
};

export default KeychainStorage;
