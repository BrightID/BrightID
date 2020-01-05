// @flow
import { addApp, removeApp } from './index';
import { saveImage } from '../utils/filesystem';

type ContextInfo = {
  appLogo: string,
  verified: boolean,
  appUrl: string,
};

export const saveApp = (name: string, contextInfo: ContextInfo) => async (
  dispatch: dispatch,
) => {
  let logoFile = '';
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
      dateAdded: Date.now(),
    };

    return dispatch(addApp(appInfo));
  } catch (err) {
    console.log(err);
  }
};

export const deleteApp = (name: string) => async (dispatch: dispatch) => {
  dispatch(removeApp(name));
};
