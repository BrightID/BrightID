import RNFS from 'react-native-fs';
import { Alert } from 'react-native';
import { parseBase64, mimeFromUri } from './images';
import { uInt8ToKeyString } from './encoding';

export const createConnectionAvatarDirectory = async () => {
  try {
    await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/avatars`);
    return 'success';
  } catch (err) {
    Alert.alert('Error', err.stack);
  }
};

export const saveAvatar = async ({ base64Image, publicKey }) => {
  try {
    const { filetype, image } = parseBase64(base64Image);
    const key = uInt8ToKeyString(publicKey);
    const path = `${RNFS.DocumentDirectoryPath}/avatars/${key}.${filetype}`;
    await RNFS.writeFile(path, image, 'base64');
    return `${key}.${filetype}`;
  } catch (err) {
    Alert.alert('Error', err.stack);
  }
};

export const retrieveAvatar = async (filename) => {
  try {
    const mime = mimeFromUri(filename);
    const base64Image = await RNFS.readFile(
      `${RNFS.DocumentDirectoryPath}/avatars/${filename}`,
      'base64',
    );
    return `data:${mime};base64,${base64Image}`;
  } catch (err) {
    Alert.alert('Error', err.stack);
  }
};
