import { createMigrate } from 'redux-persist';
import { setInternetCredentials } from 'react-native-keychain';
import { compose } from 'ramda';
import { saveSecretKey } from '@/utils/keychain';

import { objToUint8, uInt8ArrayToB64 } from '@/utils/encoding';
import { BACKUP_URL } from '@/utils/constants';

const keyToString = compose(uInt8ArrayToB64, objToUint8);

const migrations = {
  8: (state) => {
    delete state.user.notifications;
    delete state.connectQrData;
    delete state.connectUserData;
    state.apps = {
      apps: [],
      linkedContexts: [],
      oldLinkedContexts: [],
    };
    return state;
  },
  7: (state) => {
    delete state.channels;
    delete state.pendingConnections;
    delete state.notifications;
    state.user.notifications = [];
    state.connectQrData = {
      myQrData: undefined,
      peerQrData: {
        aesKey: '',
        ipAddress: '',
        uuid: '',
        qrString: '',
        channel: '',
        type: '',
      },
    };
    state.connectUserData = {
      id: '',
      photo: '',
      name: '',
      timestamp: 0,
      signedMessage: '',
      score: 0,
    };
    return state;
  },
  6: (state) => {
    delete state.user.notifications;
    delete state.connectQrData;
    delete state.connectUserData;
    return state;
  },
  5: async (state) => {
    try {
      // secret key defaults to empty object
      let secretKey = state.user?.secretKey;
      if (Object.keys(secretKey).length && state.user.id) {
        // save secret key in keychain storage

        await saveSecretKey(state.user.id, keyToString(secretKey));

        // save backup password
        await setInternetCredentials(
          BACKUP_URL,
          state.user.id,
          state.user.password,
        );
        // delete secret key from async storage
        // delete state.user.secretKey;
      }
    } catch (err) {
      console.log(err.message);
      alert(
        'Unable to access device keychain, please let BrightID core team know about this issue..',
      );
    }

    return state;
  },
};

export const migrate = createMigrate(migrations);
