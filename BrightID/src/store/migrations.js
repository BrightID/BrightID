import { createMigrate } from 'redux-persist';
import {
  setGenericPassword,
  setInternetCredentials,
} from 'react-native-keychain';
import { compose } from 'ramda';
import { objToUint8, uInt8ArrayToB64 } from '@/utils/encoding';
import { BACKUP_URL } from '@/utils/constants';

const keyToString = compose(uInt8ArrayToB64, objToUint8);

const migrations = {
  5: async (state) => {
    try {
      // secret key defaults to empty object
      let secretKey = state.user?.secretKey;
      if (Object.keys(secretKey).length) {
        // save secret key in keychain storage
        await setGenericPassword(
          state.user.id ?? 'empty',
          keyToString(secretKey),
        );
        // secondary backup
        await setInternetCredentials(
          'secretKey',
          state.user.id ?? 'empty',
          keyToString(secretKey),
        );
        // save backup password
        await setInternetCredentials(
          BACKUP_URL,
          state.user.id,
          state.user.password,
        );
        // delete secret key from async storage
        delete state.user.secretKey;
      }
    } catch (err) {
      console.log(err.message);
      alert('Unable to access device keychain...');
    }

    return state;
  },
};

export const migrate = createMigrate(migrations);
