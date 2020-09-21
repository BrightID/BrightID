import { createMigrate } from 'redux-persist';
import {
  setInternetCredentials,
  getGenericPassword,
  STORAGE_TYPE,
  setGenericPassword,
} from 'react-native-keychain';
import { compose } from 'ramda';

import { objToUint8, uInt8ArrayToB64 } from '@/utils/encoding';
import { BACKUP_URL, DEVICE_ANDROID } from '@/utils/constants';

const keyToString = compose(uInt8ArrayToB64, objToUint8);

const migrations = {
  8: async (state) => {
    delete state.user.notifications;
    delete state.connectQrData;
    delete state.connectUserData;
    // transfer linked contexts
    let linkedContexts = [];
    if (state.apps.apps) {
      linkedContexts = state.apps.apps.map((app) => ({
        dateAdded: Date.now(),
        contextId: app.contextId,
        context: app.context,
        state: app.state,
      }));
    }

    // transfer secret key as backup
    let genericPassword = await getGenericPassword();
    let { username, password } = genericPassword;
    if (password) {
      state.user.id = username;
      state.user.secretKey = password;
    }

    state.apps = {
      apps: [],
      linkedContexts,
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
      if (secretKey && Object.keys(secretKey).length && state.user?.id) {
        // save secret key in keychain storage

        if (DEVICE_ANDROID) {
          let opts = { storage: STORAGE_TYPE.AES };
          await setGenericPassword(state.user.id, keyToString(secretKey), opts);
        } else {
          await setGenericPassword(state.user.id, keyToString(secretKey));
        }

        // save backup password
        await setInternetCredentials(
          BACKUP_URL,
          state.user.id,
          state.user.password,
        );
      }
    } catch (err) {
      console.log(err.message);
      alert(
        'Unable to access device keychain, please let BrightID core team know about this issue..',
      );
    }
    state.user.secretKey = keyToString(state.user.secretKey);
    return state;
  },
};

export const migrate = createMigrate(migrations);
