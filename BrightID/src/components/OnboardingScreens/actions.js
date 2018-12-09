// @flow

import { Alert, AsyncStorage } from 'react-native';
import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { sampleConnections } from '../../actions/setUpDefault';
import { setUserData } from '../../actions';
import {
  createConnectionAvatarDirectory,
  saveAvatar,
} from '../../utils/filesystem';
import api from '../../Api/BrightIdApi';

export const handleBrightIdCreation = ({ nameornym, avatar }) => async (
  dispatch: () => null,
) => {
  try {
    if (!nameornym) {
      return Alert.alert('Please add your name or nym');
    }

    await createConnectionAvatarDirectory();
    // create public / private key pair
    const { publicKey, secretKey } = nacl.sign.keyPair();

    const userData = {
      publicKey,
      secretKey,
      nameornym,
    };
    // save avatar photo
    if (avatar) {
      const uri = await saveAvatar({ publicKey, base64Image: avatar.uri });
      userData.avatar = { uri: `file://${uri}` };
    } else {
      const uri = await fakeUserAvatar(publicKey);
      userData.avatar = { uri: `file://${uri}` };
    }
    let creationResponse = await api.createUser(publicKey);
    console.log(creationResponse);
    if (creationResponse.data && creationResponse.data.key) {
      // // save avatar photo base64 data, and user data in async storage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      // // update redux store
      await dispatch(setUserData(userData));
      // // navigate to home page
      return 'success';
    } else {
      alert(
        creationResponse.errorMessage
          ? creationResponse.errorMessage
          : 'Error in user creation.',
      );
      return 'fail';
    }
    // catch any errors with saving data or generating the public / private key
  } catch (err) {
    Alert.alert('Error', err.stack);
  }
};

const fakeUserAvatar = async (publicKey) => {
  try {
    // save each connection with their public key as the async storage key
    const res = await RNFetchBlob.fetch(
      'GET',
      'https://loremflickr.com/180/180',
      {},
    );
    if (res.info().status === 200) {
      const uri = await saveAvatar({
        publicKey,
        base64Image: `data:image/jpeg;base64,${res.base64()}`,
      });
      return uri;
    } else {
      return 'https://loremflickr.com/180/180';
    }
  } catch (err) {
    console.log(err);
  }
};
