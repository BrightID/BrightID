// @flow

import {
  getGenericPassword,
  setGenericPassword,
  resetGenericPassword,
} from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEVICE_ANDROID } from '@/utils/constants';
import { b64ToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';

const getItem = async (key: string) => {
  try {
    let { username, password } = await getGenericPassword();
    console.log('getKeychain', username, password);
    let { publicKey, version } = JSON.parse(username);
    if (!publicKey || !password) {
      throw new Error(`keypair does not exist in keychain!`);
    }
    let secretKey = b64ToUint8Array(password);
    return {
      publicKey,
      secretKey,
      _persist: { version, rehydrated: true },
    };
  } catch (err) {
    let data = await AsyncStorage.getItem(key);
    if (data) {
      console.error(`react-native-keychain is not accessible`);
      let { publicKey, secretKey, _persist } = JSON.parse(data);
      secretKey = b64ToUint8Array(secretKey);
      return { publicKey, secretKey, _persist };
    } else {
      throw err;
    }
  }
};

const setItem = async (
  key: string,
  keypair: {
    publicKey: string,
    secretKey: Uint8Array,
    _persist: { version: number },
  },
) => {
  let password = uInt8ArrayToB64(keypair.secretKey);
  try {
    let username = JSON.stringify({
      version: keypair._persist.version,
      publicKey: keypair.publicKey,
    });

    if (DEVICE_ANDROID) {
      let opts = { rules: 'none' };
      await setGenericPassword(username, password, opts);
    } else {
      await setGenericPassword(username, password);
    }
    // we can remove this later once we have better metrics for react-native-keychain
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        publicKey: keypair.publicKey,
        secretKey: password,
        _persist: keypair._persist,
      }),
    );
    return true;
  } catch (err) {
    console.error(err.message);
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        publicKey: keypair.publicKey,
        secretKey: password,
        _persist: keypair._persist,
      }),
    );
  }
};

const removeItem = async (key) => {
  try {
    await resetGenericPassword();
    await AsyncStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(err.message);
    await AsyncStorage.removeItem(key);
  }
};

const KeychainStorage = {
  getItem,
  setItem,
  removeItem,
};

export default KeychainStorage;
