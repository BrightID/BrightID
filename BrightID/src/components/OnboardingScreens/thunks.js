// @flow

import nacl from 'tweetnacl';
import { setKeypair, setPhoto, setUserId } from '@/actions';
import { createImageDirectory, saveImage } from '@/utils/filesystem';
import { b64ToUrlSafeB64, uInt8ArrayToB64 } from '@/utils/encoding';

export const createKeypair = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  // do not create new keypair if photo already exists (photo is saved using id)
  const { filename } = getState().user.photo;

  if (!filename) {
    // create public / private key pair
    let { publicKey, secretKey } = await nacl.sign.keyPair();
    let b64PubKey = uInt8ArrayToB64(publicKey);

    dispatch(setKeypair(b64PubKey, secretKey));
  }
};

export const savePhoto = (base64Image) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  // creates Image Directory
  await createImageDirectory();

  let { publicKey } = getState().keypair;
  let id = b64ToUrlSafeB64(publicKey);

  let filename = await saveImage({ imageName: id, base64Image });
  dispatch(setPhoto({ filename }));
};

export const saveId = () => async (dispatch: dispatch, getState: getState) => {
  let { publicKey } = getState().keypair;
  let id = b64ToUrlSafeB64(publicKey);

  dispatch(setUserId(id));
};
