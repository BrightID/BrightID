// @flow

import nacl from 'tweetnacl';
import pokemon from 'pokemon';
import RNFetchBlob from 'rn-fetch-blob';
import { setConnectUserData } from './index';

export const addConnection = (navigation) => (dispatch) => {
  const { publicKey } = nacl.sign.keyPair();

  const nameornym = pokemon.random();
  const trustScore = `${Math.floor(Math.random() * 99)}.${Math.floor(
    Math.random() * 9,
  )}`;

  const userData = {
    publicKey,
    nameornym,
    trustScore,
    avatar: '',
  };

  RNFetchBlob.fetch('GET', 'https://loremflickr.com/180/180', {})
    .then((res) => {
      if (res.info().status === 200) {
        userData.avatar = `data:image/jpeg;base64,${res.base64()}`;
        dispatch(setConnectUserData(userData));
        navigation.navigate('PreviewConnection');
      } else {
        dispatch(setConnectUserData(userData));
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
