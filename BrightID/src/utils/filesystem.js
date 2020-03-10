import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import { parseDataUri, mimeFromUri } from './images';

export const createImageDirectory = async () => {
  try {
    await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/photos`);
    return 'success';
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

export const saveImage = async ({ base64Image, imageName }) => {
  try {
    const { filetype, image } = parseDataUri(base64Image);
    const path = `${RNFS.DocumentDirectoryPath}/photos/${imageName}.${filetype}`;
    console.log('RNFS.DocumentDirecoryPath', RNFS.DocumentDirectoryPath);
    console.log('DocumentDir', RNFetchBlob.fs.dirs.DocumentDir);
    await RNFS.writeFile(path, image, 'base64');
    const postStat = await RNFetchBlob.fs.stat(path);
    console.log('postStat', postStat);
    return `${imageName}.${filetype}`;
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
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
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
