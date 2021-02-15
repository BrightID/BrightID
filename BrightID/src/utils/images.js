import { compose } from 'ramda';
import ImagePicker from './ImagePickerProvider';

const options = {
  cropping: true,
  width: 180,
  height: 180,
  writeTempFile: false,
  includeBase64: true,
  includeExif: true,
  cropperToolbarTitle: 'Select Photo',
  smartAlbums: ['RecentlyAdded', 'UserLibrary', 'PhotoStream', 'SelfPortraits'],
  useFrontCamera: true,
  // compressImageMaxWidth: 180,
  // compressImageMaxHeight: 180,
  compressImageQuality: 0.8,
  mediaType: 'photo',
};

export const takePhoto = () =>
  new Promise((res, rej) => {
    ImagePicker.openCamera(options)
      .then((response) => {
        res(response);
        console.log('size', response.size);
        console.log('width', response.width);
        console.log('height', response.height);
      })
      .catch((err) => {
        rej(err);
      });
  });

export const chooseImage = () =>
  new Promise((res, rej) => {
    ImagePicker.openPicker(options)
      .then((response) => {
        res(response);
        console.log('size', response.size);
        console.log('width', response.width);
        console.log('height', response.height);
      })
      .catch((err) => {
        rej(err);
      });
  });

/**
 *
 * @param {string} str
 * @returns {string}
 */
const splitDataURI = (str) => str.split(',', 2);

/**
 *
 * @param {string} mediaType
 * @param {string} image
 * @returns
 */
const mediaTypeToFileExtension = ([mediaType = 'jpeg', image = ' ']) => {
  if (mediaType.includes('jpeg')) {
    return { filetype: 'jpg', image };
  }
  if (mediaType.includes('png')) {
    return { filetype: 'png', image };
  }
  if (mediaType.includes('gif')) {
    return { filetype: 'gif', image };
  }
  if (mediaType.includes('svg')) {
    return { filetype: 'svg', image };
  }
  return { filetype: 'jpg', image };
};

export const parseDataUri = compose(mediaTypeToFileExtension, splitDataURI);

/**
 *
 * @param {string} str
 * @returns string
 */
const fileType = (str) => str.split('.').pop().toLowerCase();
/**
 *
 * @param {string} t
 * @returns string
 */

const normalizeType = (t) => {
  switch (t) {
    case 'jpg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
};

export const mimeFromUri = compose(normalizeType, fileType);
