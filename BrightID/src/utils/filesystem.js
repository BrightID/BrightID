import RNFetchBlob from 'rn-fetch-blob';
import { parseDataUri, mimeFromUri } from './images';

export const photoDirectory = () => `${RNFetchBlob.fs.dirs.DocumentDir}/photos`;

export const createImageDirectory = () => {
  return RNFetchBlob.fs
    .exists(photoDirectory())
    .then((exists) =>
      exists
        ? new Promise((resolve) => resolve(true))
        : RNFetchBlob.fs.mkdir(photoDirectory()),
    );
};

export const saveImage = async ({ base64Image, imageName }) => {
  try {
    const { filetype, image } = parseDataUri(base64Image);
    const path = `${photoDirectory()}/${imageName}.${filetype}`;
    await RNFetchBlob.fs.writeFile(path, image, 'base64');
    return `${imageName}.${filetype}`;
  } catch (err) {
    console.log(err.message);
  }
};

export const retrieveImage = async (filename) => {
  try {
    const mime = mimeFromUri(filename);
    const base64Image = await RNFetchBlob.fs.readFile(
      `${photoDirectory()}/${filename}`,
      'base64',
    );
    return `data:${mime};base64,${base64Image}`;
  } catch (err) {
    console.log(err.message);
  }
};
