// @flow

import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { Alert, NativeModules } from 'react-native';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  b64ToUrlSafeB64,
} from '@/utils/encoding';
import { navigate } from '@/NavigationService';
import { names } from '../utils/fakeNames';
import { setConnectUserData } from './index';

const { RNRandomBytes } = NativeModules;

const randomKey = (size: number) =>
  new Promise((resolve, reject) => {
    RNRandomBytes.randomBytes(size, (err, bytes) => {
      err ? reject(err) : resolve(bytes);
    });
  });

export const addFakeConnection = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const { publicKey, secretKey } = await nacl.sign.keyPair();
  const {
    user: { id },
  } = getState();
  const b64PubKey = uInt8ArrayToB64(publicKey);
  const connectId = b64ToUrlSafeB64(b64PubKey);
  // We have no createUser anymore
  // await api.createUser(id, b64PubKey);
  const { firstName, lastName } = names[
    Math.floor(Math.random() * (names.length - 1))
  ];
  const name = `${firstName} ${lastName}`;
  const score = Math.floor(Math.random() * 99);
  const timestamp = Date.now();
  const message = `Add Connection${connectId}${id}${timestamp}`;
  const signedMessage = uInt8ArrayToB64(
    nacl.sign.detached(strToUint8Array(message), secretKey),
  );
  const aesKey = await randomKey(16);
  const userData = {
    publicKey: b64PubKey,
    id: connectId,
    timestamp,
    secretKey,
    signedMessage,
    name,
    score,
    aesKey,

    photo: 'https://picsum.photos/180',
    status: 'initiated',
  };

  RNFetchBlob.fetch('GET', 'https://picsum.photos/180', {})
    .then((res) => {
      if (res.info().status === 200) {
        userData.photo = `data:image/jpeg;base64,${String(res.base64())}`;
        // dispatch(setConnectUserData(userData));
        navigate('PreviewConnection');
      } else {
        Alert.alert('Error', 'Unable to fetch image');
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
