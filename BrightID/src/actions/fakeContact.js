// @flow

import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { Alert } from 'react-native';
import { names } from '../utils/fakeNames';
import { setConnectUserData } from './index';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  b64ToUrlSafeB64,
} from '../utils/encoding';

export const addFakeConnection = (navigation: navigation) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const { publicKey, secretKey } = await nacl.sign.keyPair();
  const state = getState();
  const b64PubKey = uInt8ArrayToB64(publicKey);
  const id = b64ToUrlSafeB64(b64PubKey);
  // We have no createUser anymore
  // await api.createUser(id, b64PubKey);
  const { firstName, lastName } = names[
    Math.floor(Math.random() * (names.length - 1))
  ];
  const name = `${firstName} ${lastName}`;
  const score = Math.floor(Math.random() * 99);
  const timestamp = Date.now();
  const message = `Add Connection${id}${state.id}${timestamp}`;
  const signedMessage = uInt8ArrayToB64(
    nacl.sign.detached(strToUint8Array(message), secretKey),
  );

  const userData = {
    publicKey: b64PubKey,
    id,
    timestamp,
    secretKey,
    signedMessage,
    name,
    score,
    photo: 'https://picsum.photos/180',
    status: 'initiated',
  };

  RNFetchBlob.fetch('GET', 'https://picsum.photos/180', {})
    .then((res) => {
      if (res.info().status === 200) {
        userData.photo = `data:image/jpeg;base64,${String(res.base64())}`;
        dispatch(setConnectUserData(userData));
        navigation.navigate('PreviewConnection');
      } else {
        Alert.alert('Error', 'Unable to fetch image');
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
