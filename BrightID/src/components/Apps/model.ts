import { Alert } from 'react-native';
import { propEq, find } from 'ramda';
import { addLinkedContext, addOperation } from '@/actions';
import store from '@/store';
import i18next from 'i18next';
import { NodeApi } from '@/api/brightId';
import { selectAllSigs } from '@/reducer/appsSlice';

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

export const handleBlindSigApp = async (params: Params) => {
  // if 'params' is defined, the user came through a deep link
  const { context: app, contextId: appId } = params;
  Alert.alert(
    i18next.t('apps.alert.title.linkApp'),
    i18next.t('apps.alert.text.linkApp', { context: `${app}` }),
    [
      {
        text: i18next.t('common.alert.yes'),
        onPress: () => linkAppId(app, appId),
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
  // Create temporary NodeAPI object, since only the node at the specified baseUrl knows about this context
  const { id } = store.getState().user;
  const { secretKey } = store.getState().keypair;
  const api = new NodeApi({ url: baseUrl, id, secretKey, v: 5 });
  try {
    const op = await api.linkContextId(context, contextId);
    op.api = api;
    store.dispatch(addOperation(op));
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
  }
};

const linkAppId = async (
  app: string,
  appId: string,
) => {
  // Create temporary NodeAPI object, since the node at the specified nodeUrl will be queried for the verification
  const {
    apps: { apps },
    user: { id },
    keypair: { secretKey }
  } = store.getState();
  const appInfo = find(propEq('id', app))(apps);
  const vel = appInfo.verificationExpirationLength;
  const roundedTimestamp = vel ? parseInt(Date.now() / vel) * vel : 0;

  let sigs = selectAllSigs(store.getState())
    .filter(sig => sig.app === app)
    .filter(sig => sig.roundedTimestamp === roundedTimestamp);

  if (sigs.length == 0) {
    Alert.alert(
      i18next.t('apps.alert.title.linkingFailed'),
      i18next.t('apps.alert.text.blindSigNotFound', { app: app }),
      [{
        text: i18next.t('common.alert.dismiss'),
        style: 'cancel',
        onPress: () => null,
      }]
    );
    return;
  }

  const network = __DEV__ ? 'test' : 'node';
  const url = appInfo.nodeUrl || `http://${network}.brightid.org`;
  const api = new NodeApi({ url, id, secretKey });
  for (const sig of sigs) {
    try {
      const res = await api.linkAppId(sig, appId);
    } catch (e) {
      console.log(e);
      Alert.alert(i18next.t('apps.alert.title.linkingFailed'), `${e.message}`, [
        {
          text: i18next.t('common.alert.dismiss'),
          style: 'cancel',
          onPress: () => null,
        },
      ]);
      return;
    }
    Alert.alert(
      i18next.t('apps.alert.title.linkSuccess'),
      i18next.t('apps.alert.text.linkSuccess', {
        context: appInfo.name,
      }),
    );
  }
};
