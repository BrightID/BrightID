import RNFS from 'react-native-fs';
import { Alert } from 'react-native';
import { parseBase64, mimeFromUri } from './images';

export const createConnectionPhotoDirectory = async () => {
  try {
    await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/photos`);
    return 'success';
  } catch (err) {
    Alert.alert('Error', err.stack);
  }
};

export const savePhoto = async ({ base64Image, publicKey }) => {
  try {
    const { filetype, image } = parseBase64(base64Image);
    const path = `${RNFS.DocumentDirectoryPath}/photos/${publicKey}.${filetype}`;
    await RNFS.writeFile(path, image, 'base64');
    return `${publicKey}.${filetype}`;
  } catch (err) {
    Alert.alert('Error', err.stack);
  }
};

export const retrievePhoto = async (filename) => {
  try {
    const mime = mimeFromUri(filename);
    const base64Image = await RNFS.readFile(
      `${RNFS.DocumentDirectoryPath}/photos/${filename}`,
      'base64',
    );
    return `data:${mime};base64,${base64Image}`;
  } catch (err) {
    Alert.alert('Error', err.stack);
  }
};
