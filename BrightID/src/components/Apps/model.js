// @flow
import { Alert } from 'react-native';
import nacl from 'tweetnacl';
import api from '@/Api/BrightId';
import { strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
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
    console.log('contextInfo', contextInfo);
  } catch (e) {
    console.log(e);
  } finally {
    api.baseUrl = oldBaseUrl;
  }
  if (contextInfo && contextInfo.verification) {
    Alert.alert(
      'App Verification?',
      `Do you want to verify your account in ${context} by your BrightID?`,
      [
        {
          text: 'Yes',
          onPress: () =>
            linkVerification(baseUrl, context, contextInfo, contextId),
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
    goBack();
  }
};

const linkVerification = async (baseUrl, context, contextInfo, contextId) => {
  const oldBaseUrl = api.baseUrl;
  try {
    if (contextInfo.verificationUrl) {
      const { publicKey, secretKey } = await nacl.sign.keyPair();
      const b64PubKey = uInt8ArrayToB64(publicKey);
      const sig = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(contextId), secretKey),
      );
      let resp = await fetch(contextInfo.verificationUrl, {
        method: 'PUT',
        body: JSON.stringify({
          contextId,
          publicKey: b64PubKey,
          sig,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      resp = await resp.json();
      console.log('resp', resp);
      contextId = b64PubKey;
    }
    api.baseUrl = baseUrl;
    api.linkContextId(context, contextId);
  } catch (e) {
    Alert.alert(`App verification failed`, `${e.message}\n${e.stack || ''}`, [
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

    let appInfo: AppInfo = {
      verified: contextInfo.verified,
      name,
      url: contextInfo.appUrl,
      logoFile,
      dateAdded: Date.now(),
    };

    return store.dispatch(addApp(appInfo));
  } catch (err) {
    console.log(err);
  }
};

export const deleteApp = (name: string) => {
  store.dispatch(removeApp(name));
};
