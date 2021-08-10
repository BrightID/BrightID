import {
  setInternetCredentials,
  getGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';
import { compose } from 'ramda';
import { objToUint8, uInt8ArrayToB64, b64ToUint8Array } from '@/utils/encoding';
import { BACKUP_URL } from '@/utils/constants';
import { DEVICE_ANDROID } from '@/utils/deviceConstants';
import { asyncCreateMigrate } from './asyncCreateMigrate';

const keyToString = compose(uInt8ArrayToB64, objToUint8);

/** Async migration creators require every version to return a promiseß */

const rootMigrations = {
  9: async (state) => {
    // extract secretKey if not present
    if (!state.user.secretKey || typeof state.user.secretKey !== 'string') {
      let { password } = await getGenericPassword();
      state.user.secretKey = password;
    }

    state.keypair = {
      publicKey: state.user.publicKey,
      secretKey: b64ToUint8Array(state.user.secretKey),
    };

    delete state.user.publicKey;
    delete state.user.secretKey;
    if (state.notifications) {
      delete state.notifications.miscAlreadyNotified;
    }

    // add migration key for deleting AsyncStorage(persist:root)
    state.user.migrated = true;
    state.tasks = undefined;
    return state;
  },
  8: async (state) => {
    delete state.user.notifications;
    delete state.connectQrData;
    delete state.connectUserData;
    // transfer linked contexts
    let linkedContexts = [];
    if (state.apps.apps) {
      linkedContexts = state.apps.apps.map((app) => ({
        dateAdded: app.dateAdded || Date.now(),
        contextId: app.contextId,
        context: app.name,
        state: app.state,
      }));
    }

    state.apps = {
      apps: [],
      linkedContexts,
    };

    // transfer secret key as backup
    try {
      let genericPassword = await getGenericPassword();
      let { password } = genericPassword;
      if (password) {
        state.user.secretKey = password;
      }
    } catch (err) {
      console.log(err.message);
      if (state.user.secretKey) {
        state.user.secretKey = keyToString(state.user.secretKey);
      }
    }

    return state;
  },
  7: async (state) => {
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
    };
    return state;
  },
  6: async (state) => {
    if (state.user) {
      delete state.user.notifications;
    }

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
          let opts = { rules: 'none' };
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

export const rootMigrate = asyncCreateMigrate(rootMigrations, {
  debug: __DEV__,
});
