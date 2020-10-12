/**
 * @flow
 */

import RNFetchBlob from 'rn-fetch-blob';

const createStoragePathIfNeeded = (path) =>
  RNFetchBlob.fs
    .exists(path)
    .then((exists) =>
      exists
        ? new Promise((resolve) => resolve(true))
        : RNFetchBlob.fs.mkdir(path),
    );

const onStorageReadyFactory = (storagePath: string) => (func: Function) => {
  const storage = createStoragePathIfNeeded(storagePath);
  return (...args: Array<any>) => storage.then(() => func(...args));
};

const defaultStoragePath = () =>
  `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`;

let onStorageReady = onStorageReadyFactory(defaultStoragePath());

let encoding = 'utf8';

let toFileName = (key: string) => key.replace(/[^a-z0-9.\-_]/gi, '-');

const pathForKey = (key: string) =>
  `${defaultStoragePath()}/${toFileName(key)}`;

const FilesystemStorage = {
  setItem: (key: string, value: string) => {
    return RNFetchBlob.fs.writeFile(pathForKey(key), value, encoding);
  },

  getItem: onStorageReady((key: string) => {
    const filePath = pathForKey(key);

    return RNFetchBlob.fs.readFile(filePath, encoding).then((data) => {
      if (data) {
        return data;
      } else {
        throw new Error('key does not exist in fsStorage');
      }
    });
  }),

  removeItem: (key: string) => {
    return RNFetchBlob.fs.unlink(pathForKey(key));
  },
  clear: () => {
    return RNFetchBlob.fs.unlink(defaultStoragePath());
  },
};

export default FilesystemStorage;
