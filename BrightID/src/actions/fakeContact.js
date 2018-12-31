// @flow

import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { Alert } from 'react-native';
import { names } from '../utils/fakeNames';
import api from '../Api/BrightId';
import { setConnectUserData } from './index';
import { strToUint8Array, uInt8ArrayToB64 } from '../utils/encoding';

export const addConnection = (navigation) => async (dispatch, getState) => {
  const { publicKey, secretKey } = nacl.sign.keyPair();
  const { main } = getState();

  let creationResponse = await api.createUser(publicKey);
  console.log(creationResponse.data);
  if (creationResponse.data && creationResponse.data.key) {
    const { firstName, lastName } = names[
      Math.floor(Math.random() * (names.length - 1))
    ];
    const name = `${firstName} ${lastName}`;
    const score = `${Math.floor(Math.random() * 99)}.${Math.floor(
      Math.random() * 9,
    )}`;
    const timestamp = Date.now();
    const base64Key = uInt8ArrayToB64(publicKey);
    const message = base64Key + uInt8ArrayToB64(main.publicKey) + timestamp;
    const signedMessage = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    const userData = {
      publicKey,
      timestamp,
      secretKey,
      signedMessage,
      name,
      score,
      photo: 'https://loremflickr.com/180/180/all',
    };

    RNFetchBlob.fetch('GET', 'https://loremflickr.com/180/180/all', {})
      .then((res) => {
        if (res.info().status === 200) {
          userData.photo = `data:image/jpeg;base64,${res.base64()}`;
          dispatch(setConnectUserData(userData));
          navigation.navigate('PreviewConnection');
        } else {
          Alert.alert('Error', 'Unable to fetch image');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
