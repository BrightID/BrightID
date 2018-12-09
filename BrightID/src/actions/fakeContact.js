// @flow

import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { Alert } from 'react-native';
import { names } from '../utils/fakeNames';

import { setConnectUserData } from './index';

export const addConnection = (navigation) => (dispatch) => {
  const { publicKey } = nacl.sign.keyPair();
  const { firstName, lastName } = names[
    Math.floor(Math.random() * (names.length - 1))
  ];
  const nameornym = `${firstName} ${lastName}`;
  const trustScore = `${Math.floor(Math.random() * 99)}.${Math.floor(
    Math.random() * 9,
  )}`;

  const userData = {
    publicKey,
    nameornym,
    trustScore,
    avatar: 'https://loremflickr.com/180/180',
  };

  RNFetchBlob.fetch('GET', 'https://loremflickr.com/180/180', {})
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
};
