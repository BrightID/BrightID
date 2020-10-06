// @flow

import {
  SECURITY_RULES,
  getGenericPassword,
  setGenericPassword,
  resetGenericPassword,
} from 'react-native-keychain';
import AsyncStorage from '@react-native-community/async-storage';
import { DEVICE_ANDROID } from '@/utils/constants';
import { objToB64, b64ToUint8Array } from '@/utils/encoding';

const getItem = async (key: string) => {
  console.log('keypair get item', key);
  try {
    let { username, password } = await getGenericPassword();

    if (!password) {
      throw new Error(`keypair does not exist in keychain!`);
    }

    return { id: username, secretKey: b64ToUint8Array(password) };
  } catch (err) {
    console.error(err.message);
    let data = await AsyncStorage.getItem(key);
    if (data) {
      let { id, secretKey } = JSON.parse(data);
      secretKey = b64ToUint8Array(secretKey);
      return { id, secretKey };
    } else {
      // handle data loss
    }
  }
};

const setItem = async (
  key: string,
  keypair: { id: string, secretKey: Uint8Array },
) => {
  console.log('keypair set item', key, keypair);
  if (typeof keypair.secretKey !== 'string') {
    keypair.secretKey = objToB64(keypair.secretKey);
  }

  try {
    if (DEVICE_ANDROID) {
      let opts = { rules: SECURITY_RULES.NONE };
      await setGenericPassword(keypair.id, keypair.secretKey, opts);
    } else {
      await setGenericPassword(keypair.id, keypair.secretKey);
    }
    // we can remove this later once we have better metrics for react-native-keychain
    await AsyncStorage.setItem('keypair', JSON.stringify(keypair));
  } catch (err) {
    console.error(err.message);
    await AsyncStorage.setItem('keypair', JSON.stringify(keypair));
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
