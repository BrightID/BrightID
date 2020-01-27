// @flow

import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { setUserData, setHashedId } from '../../actions';
import { createImageDirectory, saveImage } from '../../utils/filesystem';
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
    const id = b64ToUrlSafeB64(b64PubKey);
    await createImageDirectory();
    const filename = await saveImage({ imageName: id, base64Image: photo.uri });

    const userData = {
      publicKey: b64PubKey,
      id,
      secretKey,
      name,
      photo: { filename },
    };

    // TODO: Verify success before proceeding
    await api.createUser(id, b64PubKey);

    // // update redux store
    await dispatch(setUserData(userData));
    // to fix bug while testing
    dispatch(setHashedId(''));

    console.log('brightid creation success');

    // // navigate to home page
    return true;
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

export const fakeUserAvatar = (): Promise<string> => {
  // save each connection with their id as the async storage key
  return RNFetchBlob.fetch('GET', 'https://loremflickr.com/180/180/all', {})
    .then((res) => {
      if (res.info().status === 200) {
        let b64 = res.base64();
        return b64;
      } else {
        return 'https://loremflickr.com/180/180/all';
      }
    })
    .catch((err) => {
      err instanceof Error ? console.warn(err.message) : console.log(err);
    });
};
