// @flow
import { Alert } from 'react-native';
import api from '@/Api/BrightId';
import { saveImage } from '@/utils/filesystem';
import { addApp, removeApp } from '@/actions';
import { goBack } from '@/NavigationService';
import store from '@/store';

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
  const { baseUrl, context, contextId } = params;
  const oldBaseUrl = api.baseUrl;
  let contextInfo;
  try {
    api.baseUrl = baseUrl;
    contextInfo = await api.getContext(context);
  } catch (e) {
    Alert.alert('Failed', `Unable to link ${context} with BrightID`);
    console.log(e);
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
            goBack();
          },
        },
      ],
    );
  } else {
    Alert.alert('Failed', `Unable to link ${context} with BrightID`);
    goBack();
  }
};

const linkApp = async (baseUrl, context, contextInfo, contextId) => {
  const oldBaseUrl = api.baseUrl;
  try {
    api.baseUrl = baseUrl;
    await api.linkContextId(context, contextId);
  } catch (e) {
    Alert.alert(`App linking failed`, `${e.message}`, [
      {
        text: 'Dismiss',
        style: 'cancel',
        onPress: () => {
          goBack();
        },
      },
    ]);
  } finally {
    api.baseUrl = oldBaseUrl;
    if (contextInfo.isApp) {
      saveApp(context, contextInfo);
    } else {
      Alert.alert(
        'Success',
        `Succesfully sent the request to link ${context} with BrightID`,
      );
      goBack();
    }
  }
};

const saveApp = async (name: string, contextInfo: ContextInfo) => {
  let logoFile = '';
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
    };
    return store.dispatch(addApp(appInfo));

  } catch (e) {
    console.log(e);
  }
};

export const deleteApp = (name: string) => {
  store.dispatch(removeApp(name));
};
