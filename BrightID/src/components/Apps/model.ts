import { Alert } from 'react-native';
import { propEq, find } from 'ramda';
import stringify from 'fast-json-stable-stringify';
import { addLinkedContext, addOperation } from '@/actions';
import store from '@/store';
import i18next from 'i18next';
import { NodeApi } from '@/api/brightId';
import ChannelAPI from '@/api/channelService';
import { selectAllSigs } from '@/reducer/appsSlice';
import { hash, randomKey } from '@/utils/encoding';
import { BigInteger } from 'jsbn';
import { blind, unblind } from '@/utils/rsablind';

// max time to wait for app to respond to sponsoring request
const sponsorTimeout = 1000 * 30; // 30 seconds
// Interval to poll for sponsor op
const sponsorPollInterval = 3000; // 3 seconds

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

export const handleBlindSigApp = async (
  params: Params,
  setSponsoringApp,
  api,
) => {
  const { context: appId, contextId: appUserId } = params;
  Alert.alert(
    i18next.t('apps.alert.title.linkApp'),
    i18next.t('apps.alert.text.linkApp', { context: `${appId}` }),
    [
      {
        text: i18next.t('common.alert.yes'),
        onPress: () =>
          sponsorAndlinkAppId(appId, appUserId, setSponsoringApp, api),
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

const sponsorAndlinkAppId = async (
  appId: string,
  appUserId: string,
  setSponsoringApp,
  api: NodeApi,
) => {
  const {
    apps: { apps },
    user: { id, isSponsored },
  } = store.getState();
  if (isSponsored) {
    return linkAppId(appId, appUserId);
  }

  // Upload blinded sponsor request
  const appInfo = find(propEq('id', appId))(apps) as AppInfo;
  setSponsoringApp(appInfo);
  const network = __DEV__ ? 'test' : 'node';
  const baseUrl = appInfo.nodeUrl || `http://${network}.brightid.org`;
  const url = new URL(`${baseUrl}/profile`);
  const channelApi = new ChannelAPI(url.href);
  const channelId = appUserId;
  const timestamp = Date.now();
  const op: SponsorOp = {
    name: 'Sponsor',
    id,
    app: appId,
    timestamp,
    v: 6,
  };
  const message = stringify(op);
  const { n, e } = JSON.parse(appInfo.sponsorPublicKey);
  console.log(n, e, 'sponsorPublicKey');
  const { blinded, r } = blind({ message, N: n, E: e });
  const rawSuffix = await randomKey(9);
  const suffix = hash(rawSuffix);
  const dataId = `blindedBrightid-${suffix}`;
  try {
    await channelApi.upload({
      channelId,
      data: blinded.toString(),
      dataId,
    });
    console.log('blinded brightid uploaded for app to sign');
  } catch (e) {
    console.log(e);
    Alert.alert(i18next.t('apps.alert.title.linkingFailed'), `${e.message}`, [
      {
        text: i18next.t('common.alert.dismiss'),
        style: 'cancel',
        onPress: () => null,
      },
    ]);
    setSponsoringApp(null);
    return;
  }

  // wait for app to provide blinded signature for sponsor op
  let blindedSig;
  let intervalId;
  const blindedSigDataId = `blindedSig-${suffix}`;
  try {
    blindedSig = await new Promise((resolve, reject) => {
      const startTime = Date.now();
      intervalId = setInterval(async () => {
        const timeElapsed = Date.now() - startTime;
        if (timeElapsed > sponsorTimeout) {
          clearInterval(intervalId);
          reject(new Error(`Timeout waiting for app sponsor response`));
        } else {
          const dataIds = await channelApi.list(channelId);
          if (dataIds.indexOf(blindedSigDataId) !== -1) {
            console.log(
              `Downloading blinded sig from channel. Stopping interval ${intervalId}`,
            );
            clearInterval(intervalId);
            const blindedSig = await channelApi.download({
              channelId,
              dataId: blindedSigDataId,
            });
            console.log('sig', blindedSig);
            resolve(blindedSig);
          }
        }
      }, sponsorPollInterval);
    });
  } catch (e) {
    console.log(e.message);
    Alert.alert(i18next.t('apps.alert.title.linkingFailed'), `${e.message}`, [
      {
        text: i18next.t('common.alert.dismiss'),
        style: 'cancel',
        onPress: () => null,
      },
    ]);
    setSponsoringApp(null);
    return;
  }

  // unblind sig and submit sponsor op to node API
  const signed = new BigInteger(blindedSig);
  const unblinded = unblind({ signed, N: n, r });
  op.sig = unblinded.toString();
  try {
    const res = await api.sponsor(op);
    store.dispatch(addOperation(res));
  } catch (e) {
    console.log(e.message);
    Alert.alert(i18next.t('apps.alert.title.linkingFailed'), `${e.message}`, [
      {
        text: i18next.t('common.alert.dismiss'),
        style: 'cancel',
        onPress: () => null,
      },
    ]);
    setSponsoringApp(null);
    return;
  }
  // wait for applying
  setSponsoringApp(null);
  return linkAppId(appId, appUserId);
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
