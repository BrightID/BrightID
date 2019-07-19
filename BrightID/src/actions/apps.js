// @flow
import { AsyncStorage } from 'react-native';
import { setApps, addApp, removeApp } from './index';
import { saveImage } from '../utils/filesystem';

export const getApps = () => async (dispatch: dispatch) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const appKeys = allKeys.filter(key => key.startsWith('App:'));
    const appValues = await AsyncStorage.multiGet(appKeys);
    // see https://facebook.github.io/react-native/docs/asyncstorage#multiget
    const appInfos = appValues
      .map(val => JSON.parse(val[1]))
      .sort((a, b) => b.dateAdded - a.dateAdded);

    dispatch(setApps(appInfos));

  } catch (err) {
    console.log(err);
  }
};

type ContextInfo = {
  appLogo: string,
  verified: boolean,
  appUrl: string,
};

export type AppInfo = {
  name: string,
  url: string,
  logoFile: string,
  verified: boolean,
  dateAdded: number,
};

export const saveApp = (name: string, contextInfo: ContextInfo) =>
  async (dispatch: dispatch) => {
    let logoFile;
    try {
      if (contextInfo.appLogo) {
        logoFile = await saveImage({
          imageName: name,
          base64Image: contextInfo.appLogo,
        });
      }

      let appInfo: AppInfo = {
        verified: contextInfo.verified,
        name,
        url: contextInfo.appUrl,
        logoFile,
        dateAdded: Date.now()
      };

      await AsyncStorage.setItem(
        `App:${name}`,
        JSON.stringify(appInfo),
      );

      return dispatch(addApp(appInfo));

    } catch (err) {
      console.log(err);
    }
  };

export const deleteApp = (name: string) => async (dispatch: dispatch) => {
  AsyncStorage.removeItem(`App:${name}`);
  dispatch(removeApp(name));
};

