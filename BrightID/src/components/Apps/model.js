// @flow
import { Alert } from 'react-native';
import api from '@/api/brightId';
import { saveImage } from '@/utils/filesystem';
import { addLink } from '@/actions';
import { navigate } from '@/NavigationService';
import store from '@/store';
import emitter from '@/emitter';
import { find, propEq } from 'ramda';

type Params = {
  baseUrl: string,
  context: string,
  contextId: string,
};

const isValidContext = (context) => {
  const { apps } = store.getState().apps;
  const app = find(propEq('context', context))(apps);
  return app !== undefined;
};

export const handleAppContext = async (params: Params) => {
  // if 'params' is defined, the user came through a deep link
  params.baseUrl = decodeURIComponent(params.baseUrl);
  const { baseUrl, context, contextId } = params;
  if (!isValidContext(context)) {
    Alert.alert('Failed', `${context} is not a valid context!`);
    return navigate('Home');
  }
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
    store.dispatch(addLink({ context, contextId, state: 'pending' }));
    emitter.emit('setAppsStatusMessage');
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
