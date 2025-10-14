import { Axios } from 'axios';
import { Buffer } from 'buffer'
import { faker } from '@faker-js/faker';

const getImagePromise = () => {
  return new Promise((resolve, reject) => {
    const width = 256;
    const url = faker.image.personPortrait({size: width});
    Axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })
      .then((response) => {
        if (response.status !== 200) {
          reject(Error(`Failed to obtain image. Status: ${response.status}`));
        } else {
          let base64data = Buffer.from(response.data, 'base64');
          // reconstruct image size from base64 data
          let paddingSize = 0;
          if (base64data.endsWith('==')) paddingSize = 2;
          else if (base64data.endsWith('=')) paddingSize = 1;
          const size = base64data.length * (3 / 4) - paddingSize;
          resolve({
            size,
            data: base64data,
            width: width,
            height: width,
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
  openCamera(_options) {
    return getImagePromise();
  },
  openPicker(_options) {
    return getImagePromise();
  },
};
