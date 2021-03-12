import { Alert } from 'react-native';
import api from '@/api/brightId';
import { addLinkedContext } from '@/actions';
import store from '@/store';
import i18next from 'i18next';

export type Params = {
  baseUrl: string;
  context: string;
  contextId: string;
};

export const handleAppContext = async (params: Params) => {
  // if 'params' is defined, the user came through a deep link
  params.baseUrl = decodeURIComponent(params.baseUrl);
  const { baseUrl, context, contextId } = params;
  Alert.alert(
    i18next.t('apps.alert.title.linkApp'),
    i18next.t('apps.alert.text.linkApp', { context: `${context}` }),
    [
      {
        text: i18next.t('common.alert.yes'),
        onPress: () => linkContextId(baseUrl, context, contextId),
      },
      {
        text: i18next.t('common.alert.no'),
        style: 'cancel',
        onPress: () => null,
      },
    ],
  );
};

const linkContextId = async (
  baseUrl: string,
  context: string,
  contextId: string,
) => {
  const oldBaseUrl = api.baseUrl;
  try {
    api.baseUrl = baseUrl;
    await api.linkContextId(context, contextId);
    store.dispatch(
      addLinkedContext({
        context,
        contextId,
        dateAdded: Date.now(),
        state: 'pending',
      }),
    );
  } catch (e) {
    Alert.alert(i18next.t('apps.alert.title.linkingFailed'), `${e.message}`, [
      {
        text: i18next.t('common.alert.dismiss'),
        style: 'cancel',
        onPress: () => null,
      },
    ]);
  } finally {
    api.baseUrl = oldBaseUrl;
  }
};
