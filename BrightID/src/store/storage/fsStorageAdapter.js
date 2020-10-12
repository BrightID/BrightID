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
  console.log('creating storage if needed');
  return (...args: Array<any>) => storage.then(() => func(...args));
};

const defaultStoragePath = `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`;

let onStorageReady = onStorageReadyFactory(defaultStoragePath);
let options = {
  storagePath: defaultStoragePath,
  encoding: 'utf8',
  toFileName: (name: string) => name.split(':').join('-'),
  fromFileName: (name: string) => name.split('-').join(':'),
};

const pathForKey = (key: string) =>
  `${options.storagePath}/${options.toFileName(key)}`;

const FilesystemStorage = {
  config: (customOptions: Object) => {
    options = {
      ...options,
      ...customOptions,
    };
    onStorageReady = onStorageReadyFactory(options.storagePath);
  },

  setItem: (key: string, value: string, callback?: (error: ?Error) => void) => {
    console.log('fsSetItem', key, value);
    return RNFetchBlob.fs
      .writeFile(pathForKey(key), value, options.encoding)
      .then(() => callback && callback())
      .catch((error) => callback && callback(error));
  },

  getItem: onStorageReady(
    (
      key: string,
      callback?: (error: ?Error, result: ?(Array<number> | string)) => void,
    ) => {
      const filePath = pathForKey(options.toFileName(key));

      return RNFetchBlob.fs
        .readFile(filePath, options.encoding)
        .then((data) => {
          console.log(key, data);
          if (data) {
            console.log('fsgetItem', key, true);
            return data;
          } else {
            console.log('fsgetItem', key, false);
            throw new Error('key does not exist in fsStorage');
          }
        })
        .catch((err) => {
          console.log('fsgetItem', key, false, err.message);
          throw err;
        });
    },
  ),

  removeItem: (key: string) => {
    console.log('fsRemoveItem', key);
    return RNFetchBlob.fs.unlink(pathForKey(options.toFileName(key)));
  },

  getAllKeys: () =>
    RNFetchBlob.fs
      .exists(options.storagePath)
      .then((exists) =>
        exists ? true : RNFetchBlob.fs.mkdir(options.storagePath),
      )
      .then(() =>
        RNFetchBlob.fs
          .ls(options.storagePath)
          .then((files) =>
            files.map<string>((file) => options.fromFileName(file)),
          )
          .then((files) => {
            return files;
          }),
      ),
};

FilesystemStorage.clear = () =>
  FilesystemStorage.getAllKeys((error, keys) => {
    if (error) throw error;

    if (Array.isArray(keys) && keys.length) {
      const removedKeys = [];

      keys.forEach((key) => {
        FilesystemStorage.removeItem(key, (err: ?Error) => {
          removedKeys.push(key);
          if (err) {
            console.error(err.message);
          }
        });
      });
      return true;
    }
    return false;
  });

export default FilesystemStorage;
