// @flow

import { Alert, AsyncStorage } from 'react-native';
import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { setUserData } from '../../actions';
import {
  createConnectionPhotoDirectory,
  savePhoto,
} from '../../utils/filesystem';
import api from '../../Api/BrightId';
import { b64ToUrlSafeB64, uInt8ArrayToB64 } from '../../utils/encoding';

export const handleBrightIdCreation = ({
  name,
  photo,
}: {
  name: string,
  photo: { uri: string },
}) => async (dispatch: dispatch) => {
  try {
    // create public / private key pair
    const { publicKey, secretKey } = nacl.sign.keyPair();
    const b64PubKey = uInt8ArrayToB64(publicKey);
    const safePubKey = b64ToUrlSafeB64(b64PubKey);
    await createConnectionPhotoDirectory();
    const filename = await savePhoto({ safePubKey, base64Image: photo.uri });

    const userData = {
      publicKey: b64PubKey,
      secretKey,
      name,
      photo: { filename },
    };

    let creationResponse = await api.createUser(b64PubKey);
    if (creationResponse.data && creationResponse.data.key) {
      // // save photo base64 data, and user data in async storage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      // // update redux store
      await dispatch(setUserData(userData));
      // // navigate to home page
      console.log(`brightid creation success: ${creationResponse.data.key}`);
      return true;
    } else {
      alert(
        creationResponse.errorMessage
          ? creationResponse.errorMessage
          : 'Error in user creation.',
      );
      // change this
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      // // update redux store
      await dispatch(setUserData(userData));
      // // navigate to home page
      return true;
    }
    // catch any errors with saving data or generating the public / private key
  } catch (err) {
    Alert.alert('Error', err.stack);
  }
};

export const fakeUserAvatar = async () => {
  try {
    // save each connection with their public key as the async storage key
    const res = await RNFetchBlob.fetch(
      'GET',
      'https://loremflickr.com/180/180/all',
      {},
    );
    if (res.info().status === 200) {
      return res.base64();
    } else {
      return 'https://loremflickr.com/180/180/all';
    }
  } catch (err) {
    console.log(err);
  }
};
