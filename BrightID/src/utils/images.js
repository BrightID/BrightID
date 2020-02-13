// @flow

import { Platform } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { compose } from 'ramda';

const isIOS = Platform.OS === 'ios';

export const selectImage = () =>
  new Promise((res, rej) => {
    const options = {
      title: 'Select Photo',
      mediaType: 'photo',
      maxWidth: 180,
      maxHeight: 180,
      quality: isIOS ? 1.0 : 0.8,
      allowsEditing: true,
      loadingLabelText: 'loading photo...',
      customButtons: [],
      noData: !!isIOS,
    };

    if (__DEV__) {
      options.customButtons = [{ name: 'random', title: 'Random Avatar' }];
    }

    ImagePicker.showImagePicker(options, (response) => {
      if (response.error) {
        rej(response.error);
      } else if (response.customButton) {
        res(randomAvatar());
      } else {
        res(response);
      }
    });
  });

const fakeUserAvatar = (): Promise<string> => {
  // save each connection with their id as the async storage key
  return RNFetchBlob.fetch('GET', 'https://loremflickr.com/180/180/all', {})
    .then((res) => {
      if (res.info().status === 200) {
        let b64 = res.base64();
        return b64;
      } else {
        return 'https://loremflickr.com/180/180/all';
      }
    })
    .catch((err) => {
      err instanceof Error ? console.warn(err.message) : console.log(err);
    });
};

const randomAvatar = async (): Promise<void> => {
  try {
    const randomImage: string = await fakeUserAvatar();
    return isIOS
      ? {
          uri: `data:image/jpeg;base64,${randomImage}`,
        }
      : { uri: 'data.jpg', data: randomImage };
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
  return { filetype: 'jpg', image };
};

export const parseDataUri = compose(mediaTypeToFileExtension, splitDataURI);

const fileType = (str: string): string =>
  str
    .split('.')
    .pop()
    .toLowerCase();

const normalizeType = (t: string): string => {
  switch (t) {
    case 'jpg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
};

export const mimeFromUri = compose(normalizeType, fileType);
