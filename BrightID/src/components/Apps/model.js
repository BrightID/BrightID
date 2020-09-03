// @flow
import { Alert } from 'react-native';
import api from '@/api/brightId';
import { addLinkedApp } from '@/actions';
import { navigate } from '@/NavigationService';
import store from '@/store';

type Params = {
  baseUrl: string,
  context: string,
  contextId: string,
};

export const handleAppContext = async (params: Params) => {
  // if 'params' is defined, the user came through a deep link
  params.baseUrl = decodeURIComponent(params.baseUrl);
  const { baseUrl, context, contextId } = params;
  Alert.alert(
    'Link App?',
    `Do you want to link your account in ${context} to your BrightID?`,
    [
      {
        text: 'Yes',
        onPress: () => linkContextId(baseUrl, context, contextId),
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
};

const linkContextId = async (baseUrl, context, contextId) => {
  const oldBaseUrl = api.baseUrl;
  try {
    api.baseUrl = baseUrl;
    await api.linkContextId(context, contextId);
    store.dispatch(addLinkedApp({ context, contextId, state: 'pending' }));
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
