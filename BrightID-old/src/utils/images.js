// @flow

import { compose } from 'ramda';

// split on comma in Data URI
// e.g. "data:image/png;base64,iVBORw0KGg"
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

export const parseDataUri = compose(
  mediaTypeToFileExtension,
  splitDataURI,
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
