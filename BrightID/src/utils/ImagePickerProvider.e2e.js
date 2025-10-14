/*
 Mock implementation of react-native-image-crop-picker.

 Instead of opening the camera or library returns a random image

 */

import RNFetchBlob from 'react-native-blob-util';
import { faker } from '@faker-js/faker';

const getTestImagePromise = () => {
  return new Promise((resolve, reject) => {
    const width = 256;
    const url = faker.image.personPortrait({size: width});

    RNFetchBlob.fetch('GET', url, {})
      .then((result) => {
        if (result.info().status === 200) {
          let base64data = result.base64();
          // reconstruct image size from base64 data
          let paddingSize = 0;
          if (base64data.endsWith('==')) paddingSize = 2;
          else if (base64data.endsWith('=')) paddingSize = 1;
          const size = base64data.length * (3 / 4) - paddingSize;
          resolve({
            size,
            data: base64data,
            width: 180,
            height: 180,
          });
        }
      })
      .catch((err) => {
        err instanceof Error ? console.warn(err.message) : console.warn(err);
        reject(err);
      });
  });
};

export default {
  openCamera(options) {
    return getTestImagePromise();
  },
  openPicker(options) {
    return getTestImagePromise();
  },
};
