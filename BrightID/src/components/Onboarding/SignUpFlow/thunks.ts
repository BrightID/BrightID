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
    const { publicKey, secretKey } = await nacl.sign.keyPair();
    const b64PubKey = uInt8ArrayToB64(publicKey);

    dispatch(setKeypair({ publicKey: b64PubKey, secretKey }));
  }
};

export const savePhoto = (base64Image: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  // creates Image Directory
  await createImageDirectory();

  const { publicKey } = getState().keypair;
  const id = b64ToUrlSafeB64(publicKey);

  const filename = await saveImage({ imageName: id, base64Image });
  dispatch(setPhoto({ filename }));
};

export const saveId = () => (dispatch: dispatch, getState: getState) => {
  const { publicKey } = getState().keypair;
  const id = b64ToUrlSafeB64(publicKey);

  dispatch(setUserId(id));
};
