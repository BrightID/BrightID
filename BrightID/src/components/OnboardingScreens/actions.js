// @flow

import nacl from 'tweetnacl';
import { compose } from 'ramda';
import { setUserData, setHashedId } from '@/actions';
import { createImageDirectory, saveImage } from '@/utils/filesystem';
import {
  b64ToUrlSafeB64,
  uInt8ArrayToB64,
  objToUint8,
  objToB64,
} from '@/utils/encoding';
import { saveSecretKey } from '@/utils/keychain';

export const handleBrightIdCreation = ({
  name,
  photo,
}: {
  name: string,
  photo: { uri: string },
}) => async (dispatch: dispatch) => {
  try {
    // create public / private key pair
    let { publicKey, secretKey } = await nacl.sign.keyPair();
    let b64PubKey = uInt8ArrayToB64(publicKey);
    let id = b64ToUrlSafeB64(b64PubKey);

    // creates Image Directory
    await createImageDirectory();
    let filename = await saveImage({ imageName: id, base64Image: photo.uri });

    const userData = {
      publicKey: b64PubKey,
      id,
      name,
      photo: { filename },
      secretKey: objToB64(secretKey),
    };

    // We have no createUser anymore
    // new user is created while making its first connection with a verified user
    // await api.createUser(id, b64PubKey);

    // // update redux store
    await dispatch(setUserData(userData));
    // to fix bug while testing
    dispatch(setHashedId(''));
    // save id / secretKey inside of keychain
    await saveSecretKey(id, secretKey);

    console.log('brightid creation success');

    // // navigate to home page
    return true;
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
