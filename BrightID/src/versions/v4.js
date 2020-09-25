// @flow

import AsyncStorage from '@react-native-community/async-storage';
import { store } from '@/store';
import {
  setApps,
  hydrateConnections,
  hydrateUser,
  setGroups,
  setInvites,
} from '@/actions';
import { objToUint8, uInt8ArrayToB64, objToB64 } from '@/utils/encoding';
import { saveSecretKey } from '@/utils/keychain';

// export const bootstrapV4 = hydrateStore('store@v4');

export const bootstrap = async (version: string) => {
  const dataStr = await AsyncStorage.getItem(version);
  if (dataStr !== null) {
    const dataObj = JSON.parse(dataStr);
    // save secretKey in keychain
    if (!dataObj.id) {
      dataObj.id = uInt8ArrayToB64(objToUint8(dataObj.publicKey));
    }

    dataObj.searchParam = '';
    await saveSecretKey(dataObj.id, secretKey);
    const secretKey = objToB64(dataObj.secretKey);

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
        publicKey,
        password,
        hashedId,
        secretKey,
      }),
    );
  }
};
