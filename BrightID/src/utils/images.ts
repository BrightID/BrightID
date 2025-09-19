import { compose } from 'ramda';
import { Image, Options } from 'react-native-image-crop-picker';
import ImagePicker from './ImagePickerProvider';

const options: Options = {
  cropping: true,
  width: 180,
  height: 180,
  writeTempFile: false,
  includeBase64: true,
  includeExif: true,
  cropperToolbarTitle: 'Select Photo',
  smartAlbums: ['RecentlyAdded', 'UserLibrary', 'PhotoStream', 'SelfPortraits'],
  useFrontCamera: true,
  compressImageQuality: 0.8,
  mediaType: 'photo',
  cropperToolbarColor: '#1C2526', // Dark background for toolbar
  cropperToolbarWidgetColor: '#FFFFFF', // White icons/text
  cropperStatusBarColor: '#1C2526', // Dark status bar
  cropperActiveWidgetColor: '#FFFFFF', // White for active elements
  // cropperToolbarTextColor: '#FFFFFF', // White toolbar text
};

export const takePhoto = () =>
  new Promise<Image>((res, rej) => {
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
  new Promise<Image>((res, rej) => {
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
 * @returns {string[]}
 */
const splitDataURI = (str: string): string[] => str.split(',', 2);

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
const fileType = (str: string) => str.split('.').pop().toLowerCase();
/**
 *
 * @param {string} t
 * @returns string
 */

const normalizeType = (t: 'jpg' | 'png' | 'gif' | 'svg') => {
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
