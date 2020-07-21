// @flow
import { Alert } from 'react-native';
import api from '@/api/brightId';
import { saveImage } from '@/utils/filesystem';
import { addApp, removeApp } from '@/actions';
import { navigate } from '@/NavigationService';
import store from '@/store';
import { find, propEq } from 'ramda';

type Params = {
  baseUrl: string,
  context: string,
  contextId: string,
};

type ContextInfo = {
  appLogo: string,
  verified: boolean,
  appUrl: string,
};

export const handleAppContext = async (params: Params) => {
  // if 'params' is defined, the user came through a deep link
  params.baseUrl = decodeURIComponent(params.baseUrl);
  const { baseUrl, context, contextId } = params;
  const oldBaseUrl = api.baseUrl;
  let contextInfo;
  try {
    api.baseUrl = baseUrl;
    contextInfo = await api.getContext(context);
  } catch (e) {
    console.log(e.message);
  } finally {
    api.baseUrl = oldBaseUrl;
  }
  if (contextInfo && contextInfo.verification) {
    Alert.alert(
      'Link App?',
      `Do you want to link your account in ${context} to your BrightID?`,
      [
        {
          text: 'Yes',
          onPress: () => linkApp(baseUrl, context, contextInfo, contextId),
        },
        {
          text: 'No',
          style: 'cancel',
          onPress: () => {
            navigate('Home');
          },
        },
      ],
    );
  } else {
    Alert.alert('Failed', `Unable to link ${context} with BrightID`);
    navigate('Home');
  }
};

const linkApp = async (baseUrl, context, contextInfo, contextId) => {
  if (contextInfo.isApp) {
    saveApp(context, contextInfo);
  }
  const oldBaseUrl = api.baseUrl;
  try {
    api.baseUrl = baseUrl;
    await api.linkContextId(context, contextId);
    if (!contextInfo.isApp) {
      Alert.alert(
        'Success',
        `Succesfully sent the request to link ${context} with BrightID`,
      );
      navigate('Home');
    }
  } catch (e) {
    Alert.alert(`App linking failed`, `${e.message}`, [
      {
        text: 'Dismiss',
        style: 'cancel',
        onPress: () => {},
      },
    ]);
  } finally {
    api.baseUrl = oldBaseUrl;
  }
};

const saveApp = async (name: string, contextInfo: ContextInfo) => {
  let logoFile = '';
  const {
    apps: { apps },
  } = store.getState();
  const app = find(propEq('name', name))(apps);
  try {
    if (contextInfo.appLogo) {
      logoFile = await saveImage({
        imageName: name,
        base64Image: contextInfo.appLogo,
      });
    }

    const appInfo: AppInfo = {
      verification: contextInfo.verification,
      name,
      url: contextInfo.appUrl,
      logoFile,
      dateAdded: Date.now(),
      state: 'initiated',
      contextId: app ? app.contextId : null,
      linked: app ? app.linked : false,
    };
    return store.dispatch(addApp(appInfo));
  } catch (e) {
    console.log(e);
  }
};

export const deleteApp = (name: string) => {
  store.dispatch(removeApp(name));
};
