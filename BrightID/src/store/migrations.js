import { createMigrate } from 'redux-persist';
import { setGenericPassword } from 'react-native-keychain';
import { compose } from 'ramda';
import { objToUint8, uInt8ArrayToB64 } from '@/utils/encoding';

const keyToString = compose(uInt8ArrayToB64, objToUint8);

const migrations = {
  5: async (state) => {
    // secret key defaults to empty object
    let secretKey = state.user?.secretKey;
    if (Object.keys(secretKey).length) {
      // save secret key in keychain storage
      await setGenericPassword(
        state.user.id ?? 'empty',
        keyToString(secretKey),
      );
      // delete secret key from async storage
      delete state.user.secretKey;
    }

    return state;
  },
};

export const migrate = createMigrate(migrations);
