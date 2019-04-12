// @flow

import { compose } from 'ramda';

// image -> [datatype, base64]
const splitString = (str: string) => str.split(',');

const extractData = ([data = 'jpeg', image = ' ']): {
  filetype: string,
  image: string,
} => {
  switch (data) {
    case data.includes('jpeg'):
      return { filetype: 'jpg', image };
    case data.includes('png'):
      return { filetype: 'png', image };
    case data.includes('gif'):
      return { filetype: 'gif', image };
    default:
      return { filetype: 'jpg', image };
  }
};

export const parseBase64 = compose(
  extractData,
  splitString,
);

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

export const mimeFromUri = compose(
  normalizeType,
  fileType,
);
