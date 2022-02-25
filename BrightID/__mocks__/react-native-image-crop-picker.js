import { Axios } from 'axios';

const getImagePromise = () => {
  return new Promise((resolve, reject) => {
    Axios({
      url: 'https://loremflickr.com/180/180',
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
    return getImagePromise();
  },
  openPicker(options) {
    return getImagePromise();
  },
};
