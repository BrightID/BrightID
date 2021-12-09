import { Alert } from 'react-native';
import { propEq, find } from 'ramda';
import i18next from 'i18next';
import {
  addLinkedContext,
  addOperation,
  setIsSponsored,
  updateSig,
} from '@/actions';
import store from '@/store';
import { NodeApi } from '@/api/brightId';
import { selectAllSigs } from '@/reducer/appsSlice';
import BrightidError, {
  APP_ID_NOT_FOUND,
  DUPLICATE_UID_ERROR,
} from '@/api/brightidError';

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
  api: NodeApi,
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
    Alert.alert(
      i18next.t('apps.alert.title.linkingFailed'),
      `${(e as Error).message}`,
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

  // Create temporary NodeAPI object, since the node at the specified nodeUrl will be queried for the verification
  const network = __DEV__ ? 'test' : 'node';
  const url = appInfo.nodeUrl || `http://${network}.brightid.org`;
  const api = new NodeApi({ url, id, secretKey });
  const linkedTimestamp = Date.now();
  for (const sig of sigs) {
    try {
      await api.linkAppId(sig, appUserId);
    } catch (e) {
      console.log(e);
      if (e instanceof BrightidError && e.errorNum === DUPLICATE_UID_ERROR) {
        // this sig is already linked with the app. Can happen if app state is out
        // of sync with backend. Ignore and continue.
        console.log(`Ignoring DUPLICATE_UID_ERROR - already linked.`);
      } else {
        Alert.alert(
          i18next.t('apps.alert.title.linkingFailed'),
          `${(e as Error).message}`,
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
    // mark sig as linked with app
    store.dispatch(
      updateSig({
        ...sig,
        linked: true,
        linkedTimestamp,
        appUserId,
      }),
    );
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
    user: { isSponsored },
  } = store.getState();
  if (isSponsored) {
    await linkAppId(appId, appUserId);
  } else {
    /*
    1. get appId from deep link
    2. already Sponsored? yes: go to step 6. no: go to step 3.
    3. optimistically send Spend Sponsorship operation.
    4. wait a bit for node to process sponsor operation from app.
    5. check GET /sponsorships/{appId} to see if it really got sponsored.
    6. proceed with posting the verification to the node under the appId.
     */
    const appInfo = find(propEq('id', appId))(apps) as AppInfo;
    setSponsoringApp(appInfo);
    console.log(`Sending spend sponsorship op...`);
    const op = await api.spendSponsorship(appId, appUserId);

    // TODO wait for op to be applied before starting polling sponsorship status?

    // wait for app to complete the sponsorship
    try {
      await new Promise<void>((resolve, reject) => {
        const startTime = Date.now();
        const intervalId = setInterval(async () => {
          const timeElapsed = Date.now() - startTime;
          if (timeElapsed > sponsorTimeout) {
            clearInterval(intervalId);
            reject(new Error(`Timeout waiting for sponsorship`));
          } else {
            try {
              const sponsorshipInfo = await api.getSponsorShip(appUserId);
              console.log(`Got sponsorRes: ${sponsorshipInfo}`);
              if (sponsorshipInfo.state === 'done') {
                console.log(`Sponsorship complete!`);
                clearInterval(intervalId);
                resolve();
              }
            } catch (e) {
              if (
                e instanceof BrightidError &&
                e.errorNum === APP_ID_NOT_FOUND
              ) {
                // node has not yet registered the sponsor request -> Ignore
                console.log(
                  `sponsor request for ${appUserId} not yet existing`,
                );
              } else {
                throw e;
              }
            }
          }
        }, sponsorPollInterval);
      });
      // sponsoring complete
      store.dispatch(setIsSponsored(true));
      // now link app.
      await linkAppId(appId, appUserId);
    } catch (e) {
      console.log(`Error getting sponsored: ${(e as Error).message}`);
      Alert.alert(
        i18next.t('apps.alert.title.linkingFailed'),
        `${(e as Error).message}`,
        [
          {
            text: i18next.t('common.alert.dismiss'),
            style: 'cancel',
            onPress: () => null,
          },
        ],
      );
    } finally {
      setSponsoringApp(undefined);
    }
  }
};
