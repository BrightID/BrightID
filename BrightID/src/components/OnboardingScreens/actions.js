// @flow

import { Alert, AsyncStorage } from 'react-native';
import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { setUserData } from '../../actions';
import {
  createImageDirectory,
  saveImage,
} from '../../utils/filesystem';
import api from '../../Api/BrightId';
import { b64ToUrlSafeB64, uInt8ArrayToB64 } from '../../utils/encoding';

export const handleBrightIdCreation = ({ name, photo }: {
  name: string,
  photo: { uri: string },
}) => async (dispatch: dispatch) => {
  try {
    // create public / private key pair
    const { publicKey, secretKey } = nacl.sign.keyPair();
    const b64PubKey = uInt8ArrayToB64(publicKey);
    const safePubKey = b64ToUrlSafeB64(b64PubKey);
    await createImageDirectory();
    const filename = await saveImage({ imageName: safePubKey, base64Image: photo.uri });

    const userData = {
      publicKey: b64PubKey,
      safePubKey,
      secretKey,
      name,
      photo: { filename },
    };

    await api.createUser(b64PubKey);

    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    // // update redux store
    await dispatch(setUserData(userData));

    console.log('brightid creation success');

    // // navigate to home page
    return true;

  } catch (err) {
    Alert.alert(err.message || 'Error', err.stack);
    return false;
  }
};

export const fakeUserAvatar = (): Promise<string> => {
  // save each connection with their public key as the async storage key
  return RNFetchBlob.fetch('GET', 'https://loremflickr.com/180/180/all', {})
    .then((res) => {
      if (res.info().status === 200) {
        let b64 = res.base64();
        return b64;
      } else {
        return 'https://loremflickr.com/180/180/all';
      }
    })
    .catch((err) => console.log(err));
};
