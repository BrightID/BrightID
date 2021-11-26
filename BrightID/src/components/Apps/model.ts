import { Alert } from 'react-native';
import { propEq, find } from 'ramda';
import { addLinkedContext, addOperation } from '@/actions';
import store from '@/store';
import i18next from 'i18next';
import { NodeApi } from '@/api/brightId';
import { selectAllSigs } from '@/reducer/appsSlice';
import BrightidError, { DUPLICATE_UID_ERROR } from '@/api/brightidError';

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
  const { context: appId, contextId: appUserId } = params;
  Alert.alert(
    i18next.t('apps.alert.title.linkApp'),
    i18next.t('apps.alert.text.linkApp', { context: `${appId}` }),
    [
      {
        text: i18next.t('common.alert.yes'),
        onPress: () => sponsorAndlinkAppId(appId, appUserId),
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
  const api = new NodeApi({ url: baseUrl, id, secretKey });
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

const sponsorAndlinkAppId = async (appId: string, appUserId: string) => {
  const {
    user: { isSponsored },
  } = store.getState();
  if (isSponsored) {
    return linkAppId(appId, appUserId);
  } else {
    // TODO Remove this when we know how to handle sponsoring with blind sig apps
    Alert.alert(
      i18next.t('apps.alert.title.linkingFailed'),
      'You are not yet sponsored.',
      [
        {
          text: i18next.t('common.alert.dismiss'),
          style: 'cancel',
          onPress: () => null,
        },
      ],
    );
  }
};

const linkAppId = async (appId: string, appUserId: string) => {
  // Create temporary NodeAPI object, since the node at the specified nodeUrl will be queried for the verification
  const {
    apps: { apps },
    user: { id },
    keypair: { secretKey },
  } = store.getState();
  const appInfo = find(propEq('id', appId))(apps) as AppInfo;
  const vel = appInfo.verificationExpirationLength;
  const roundedTimestamp = vel ? Math.floor(Date.now() / vel) * vel : 0;

  const sigs = selectAllSigs(store.getState())
    .filter((sig) => sig.app === appId)
    .filter((sig) => sig.roundedTimestamp === roundedTimestamp);

  if (sigs.length === 0) {
    Alert.alert(
      i18next.t('apps.alert.title.linkingFailed'),
      i18next.t('apps.alert.text.blindSigNotFound', { app: appId }),
      [
        {
          text: i18next.t('common.alert.dismiss'),
          style: 'cancel',
          onPress: () => null,
        },
      ],
    );
    return;
  }

  const network = __DEV__ ? 'test' : 'node';
  const url = appInfo.nodeUrl || `http://${network}.brightid.org`;
  const api = new NodeApi({ url, id, secretKey });
  for (const sig of sigs) {
    try {
      const res = await api.linkAppId(sig, appUserId);
    } catch (e) {
      console.log(e);
      if (e instanceof BrightidError && e.errorNum === DUPLICATE_UID_ERROR) {
        // this sig is already linked with the app. Can happen if app state is out
        // of sync with backend. Ignore and continue.
        console.log(`Ignoring DUPLICATE_UID_ERROR - already linked.`);
      } else {
        Alert.alert(
          i18next.t('apps.alert.title.linkingFailed'),
          `${e.message}`,
          [
            {
              text: i18next.t('common.alert.dismiss'),
              style: 'cancel',
              onPress: () => null,
            },
          ],
        );
        return;
      }
    }
    Alert.alert(
      i18next.t('apps.alert.title.linkSuccess'),
      i18next.t('apps.alert.text.linkSuccess', {
        context: appInfo.name,
      }),
    );
  }
};
