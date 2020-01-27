import RNFS from 'react-native-fs';
import { Alert } from 'react-native';
import { parseDataUri, mimeFromUri } from './images';

export const createImageDirectory = async () => {
  try {
    await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/photos`);
    return 'success';
  } catch (err) {
    Alert.alert('Error', err.stack);
  }
};

export const saveImage = async ({ base64Image, imageName }) => {
  try {
    const { filetype, image } = parseDataUri(base64Image);
    const path = `${RNFS.DocumentDirectoryPath}/photos/${imageName}.${filetype}`;
    await RNFS.writeFile(path, image, 'base64');
    return `${imageName}.${filetype}`;
  } catch (err) {
    Alert.alert('Error', err.stack);
  }
};

export const retrieveImage = async (filename) => {
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
