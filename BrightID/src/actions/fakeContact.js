// @flow

import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { Alert } from 'react-native';
import { names } from '../utils/fakeNames';
import api from '../Api/BrightIdApi';
import { setConnectUserData } from './index';

export const addConnection = (navigation) => async (dispatch, getState) => {
  const { publicKey, secretKey } = nacl.sign.keyPair();

  let creationResponse = await api.createUser(publicKey);
  console.log(creationResponse.data);
  if (creationResponse.data && creationResponse.data.key) {
    const { firstName, lastName } = names[
      Math.floor(Math.random() * (names.length - 1))
    ];
    const nameornym = `${firstName} ${lastName}`;
    const trustScore = `${Math.floor(Math.random() * 99)}.${Math.floor(
      Math.random() * 9,
    )}`;

    const userData = {
      publicKey,
      secretKey,
      nameornym,
      trustScore,
      avatar: 'https://loremflickr.com/180/180/all',
    };

    RNFetchBlob.fetch('GET', 'https://loremflickr.com/180/180/all', {})
      .then((res) => {
        if (res.info().status === 200) {
          userData.avatar = `data:image/jpeg;base64,${res.base64()}`;
          dispatch(setConnectUserData(userData));
          navigation.navigate('PreviewConnection');
        } else {
          Alert.alert('Error', 'Unable to fetch avatar image');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
