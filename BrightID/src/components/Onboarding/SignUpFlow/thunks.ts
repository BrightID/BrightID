import nacl from 'tweetnacl';
import { setKeypair } from '@brightid/redux/actions';
import { setPhoto, setUserId } from '@/actions';
import { createImageDirectory, saveImage } from '@/utils/filesystem';
import { b64ToUrlSafeB64, uInt8ArrayToB64 } from '@/utils/encoding';

export const createKeypair =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    // do not create new keypair if photo already exists (photo is saved using id)
    const { filename } = getState().user.photo;

    if (!filename) {
      // create public / private key pair
      const { publicKey, secretKey } = await nacl.sign.keyPair();
      const b64PubKey = uInt8ArrayToB64(publicKey);

      dispatch(setKeypair({ publicKey: b64PubKey, secretKey }));
    }
  };

export const savePhoto =
  (base64Image: string): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    // creates Image Directory
    await createImageDirectory();

    const { publicKey } = getState().keypair;
    const id = b64ToUrlSafeB64(publicKey);

    const filename = await saveImage({ imageName: id, base64Image });
    dispatch(setPhoto({ filename }));
  };

export const saveId = () => (dispatch: AppDispatch, getState) => {
  const { publicKey } = getState().keypair;
  const id = b64ToUrlSafeB64(publicKey);

  dispatch(setUserId(id));
};
