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
      userData.avatar = { uri };
    } else {
      userData.avatar = '';
    }

    // // add sample connections to async store
    await addSampleConnections();
    // // save avatar photo base64 data, and user data in async storage
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    // // update redux store
    await dispatch(setUserData(userData));
    // // navigate to home page
    return 'success';
    // catch any errors with saving data or generating the public / private key
  } catch (err) {
    Alert.alert('Error', err);
  }
};

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const addSampleConnections = async () => {
  try {
    // save each connection with their public key as the async storage key
    /* eslint-disable */
    for (index in sampleConnections) {
      if (sampleConnections.hasOwnProperty(index)) {
        const res = await RNFetchBlob.fetch(
          'GET',
          sampleConnections[index].avatar,
          {},
        );
        if (res.info().status === 200) {
          saveAvatar({
            publicKey: sampleConnections[index].publicKey,
            base64Image: `data:image/jpeg;base64,${res.base64()}`,
          }).then((uri) => {
            sampleConnections[index].avatar = { uri };
          });
        } else {
          console.log(index);
          sampleConnections[index].avatar = {
            uri: sampleConnections[index].avatar,
          };
        }
      }
      await sleep(300);
    }
    /* eslint-enable */
    const arrayToSave = sampleConnections.map((val) => [
      JSON.stringify(val.publicKey),
      JSON.stringify(val),
    ]);

    await AsyncStorage.multiSet(arrayToSave);
  } catch (err) {
    console.log(err);
  }
};
