// @flow

import RNFetchBlob from 'rn-fetch-blob';
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

const fakeUserAvatar = (): Promise<string> => {
  // save each connection with their id as the async storage key
  return RNFetchBlob.fetch('GET', 'https://loremflickr.com/180/180', {})
    .then((res) => {
      if (res.info().status === 200) {
        let b64 = res.base64();
        return b64;
      } else {
        return 'https://loremflickr.com/180/180';
      }
    })
    .catch((err) => {
      err instanceof Error ? console.warn(err.message) : console.log(err);
    });
};

const randomAvatar = async (): Promise<void> => {
  try {
    const randomImage: string = await fakeUserAvatar();
    return { uri: 'data.jpg', data: randomImage };
  } catch (err) {
    console.log(err);
  }
};

const splitDataURI = (str: string) => str.split(',', 2);

const mediaTypeToFileExtension = ([mediaType = 'jpeg', image = ' ']): {
  filetype: string,
  image: string,
} => {
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

const fileType = (str: string): string => str.split('.').pop().toLowerCase();

const normalizeType = (t: string): string => {
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
