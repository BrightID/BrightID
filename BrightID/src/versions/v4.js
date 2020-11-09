// @flow

import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/store';
import {
  setApps,
  hydrateConnections,
  hydrateUser,
  setGroups,
  setInvites,
  setKeypair,
} from '@/actions';
import { objToUint8, uInt8ArrayToB64, b64ToUrlSafeB64 } from '@/utils/encoding';

// export const bootstrapV4 = hydrateStore('store@v4');

export const bootstrap = async (version: string) => {
  const dataStr = await AsyncStorage.getItem(version);
  if (dataStr !== null) {
    const dataObj = JSON.parse(dataStr);
    // save secretKey in keychain
    if (typeof dataObj.publicKey === 'object') {
      dataObj.publicKey = uInt8ArrayToB64(objToUint8(dataObj.publicKey));
    }
    if (!dataObj.id) {
      dataObj.id = b64ToUrlSafeB64(dataObj.publicKey);
    }

    dataObj.searchParam = '';

    const secretKey = objToUint8(dataObj.secretKey);

    const {
      apps,
      connections,
      trustedConnections,
      connectionsSort,
      score,
      name,
      photo,
      backupCompleted,
      id,
      publicKey,
      password,
      hashedId,
      groups,
      invites,
    } = dataObj;

    store.dispatch(setKeypair(publicKey, secretKey));

    if (apps) {
      store.dispatch(setApps(apps));
    }

    if (Array.isArray(groups)) {
      store.dispatch(setGroups(groups));
    } else {
      store.dispatch(setGroups([]));
    }

    if (Array.isArray(invites)) {
      store.dispatch(setInvites(invites));
    } else {
      store.dispatch(setInvites([]));
    }

    store.dispatch(
      hydrateConnections({
        connections,
        trustedConnections,
        connectionsSort,
      }),
    );

    store.dispatch(
      hydrateUser({
        score,
        name,
        photo,
        backupCompleted,
        id,
        password,
        hashedId,
      }),
    );
  }
};
