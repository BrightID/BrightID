import { Alert } from 'react-native';
import i18next from 'i18next';
import { create } from 'apisauce';
import { find, propEq } from 'ramda';
import { getSponsorship } from '@/components/Apps/model';
import { getGlobalNodeApi } from '@/components/NodeApiGate';
import {
  addLinkedContext,
  selectAllApps,
  selectAllSigs,
  selectLinkingAppInfo,
  selectSponsoringStep,
  setLinkingAppInfo,
  setLinkingAppStarttime,
  setSponsoringStep,
  setSponsorOperationHash,
  updateSig,
} from '@/reducer/appsSlice';
import {
  BrightIdNetwork,
  operation_states,
  sponsoring_steps,
} from '@/utils/constants';
import { addOperation } from '@/reducer/operationsSlice';
import { NodeApi } from '@/api/brightId';
import { selectIsSponsored, userSelector } from '@/reducer/userSlice';
import { selectIsPrimaryDevice } from '@/actions';

type startLinkingParams = {
  appInfo: AppInfo;
  appId: string;
  appUserId: string;
  baseUrl?: string;
  v: number;
};
export const startLinking =
  (params: startLinkingParams): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    const sponsoringStep = selectSponsoringStep(getState());
    if (sponsoringStep !== sponsoring_steps.IDLE) {
      console.log(
        `Can't start linking when not in IDLE state. Current state: ${sponsoringStep}`,
      );
      return;
    }
    const isSponsored = selectIsSponsored(getState());

    // store app linking details
    dispatch(setLinkingAppInfo(params));

    if (!isSponsored) {
      // trigger sponsoring workflow
      console.log(`Not yet sponsored, proceed with sponsoring`);
      const opHash = await dispatch(requestSponsoring());
      if (opHash) {
        console.log(`Sponsor op hash: ${opHash}`);
        dispatch(setSponsorOperationHash(opHash));
      }
    } else {
      // trigger app linking
      console.log(`Already sponsored, proceed with linking`);
      dispatch(setSponsoringStep(sponsoring_steps.SUCCESS));
    }
  };

export const requestSponsoring =
  (): AppThunk<Promise<string | undefined>> =>
  async (dispatch: AppDispatch, getState) => {
    const sponsoringStep = selectSponsoringStep(getState());
    if (sponsoringStep !== sponsoring_steps.IDLE) {
      console.log(
        `Can't request sponsoring when not in IDLE state. Current state: ${sponsoringStep}`,
      );
      return;
    }

    const { appUserId, appId } = selectLinkingAppInfo(getState());
    const api = getGlobalNodeApi();

    // Check if sponsoring was already requested
    dispatch(setSponsoringStep(sponsoring_steps.PRECHECK_APP));
    const sp = await getSponsorship(appUserId, api);
    if (!sp || !sp.spendRequested) {
      console.log(`Sending spend sponsorship op...`);
      const op = await api.spendSponsorship(appId, appUserId);
      dispatch(addOperation(op));
      dispatch(setSponsoringStep(sponsoring_steps.WAITING_OP));
      return op.hash;
    } else {
      // sponsoring was already requested, go to next step (waiting for sponsoring by app)
      dispatch(setSponsoringStep(sponsoring_steps.WAITING_APP));
      dispatch(setLinkingAppStarttime(Date.now()));
    }
  };

export const handleSponsorOpUpdate =
  (state: OperationStateType): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    const sponsoringStep = selectSponsoringStep(getState());
    if (sponsoringStep !== sponsoring_steps.WAITING_OP) {
      console.log(
        `Can't handle Operation update when not in WAITING_OP state. Current state: ${sponsoringStep}`,
      );
      return;
    }

    switch (state) {
      case operation_states.APPLIED:
        dispatch(setSponsoringStep(sponsoring_steps.WAITING_APP));
        dispatch(setLinkingAppStarttime(Date.now()));
        break;
      case operation_states.FAILED:
      case operation_states.EXPIRED:
        dispatch(setSponsoringStep(sponsoring_steps.ERROR_OP));
        break;
      case operation_states.UNKNOWN:
      case operation_states.INIT:
      case operation_states.SENT:
      default:
        // keep waiting
        break;
    }
  };

export const linkContextId =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const sponsoringStep = selectSponsoringStep(getState());
    if (sponsoringStep !== sponsoring_steps.SUCCESS) {
      console.log(
        `Can't start linkContext when not in SUCCESS state. Current state: ${sponsoringStep}`,
      );
      return;
    }
    dispatch(setSponsoringStep(sponsoring_steps.LINK_WAITING_V5));
    const { appId, appUserId, baseUrl } = selectLinkingAppInfo(getState());
    // Create temporary NodeAPI object, since only the node at the specified baseUrl knows about this context
    const { id } = userSelector(getState());
    const { secretKey } = getState().keypair;
    const api = new NodeApi({ url: baseUrl, id, secretKey });
    try {
      const op = await api.linkContextId(appId, appUserId);
      op.apiUrl = baseUrl;
      dispatch(addOperation(op));
      dispatch(
        addLinkedContext({
          context: appId,
          contextId: appUserId,
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

export const linkAppId =
  ({ silent }: { silent: boolean }): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    const sponsoringStep = selectSponsoringStep(getState());
    if (sponsoringStep !== sponsoring_steps.SUCCESS) {
      console.log(
        `Can't start linkAppId when not in SUCCESS state. Current state: ${sponsoringStep}`,
      );
      return;
    }
    const { id } = userSelector(getState());
    const {
      keypair: { secretKey },
    } = getState();
    const { appId, appUserId, appInfo } = selectLinkingAppInfo(getState());
    const isPrimary = selectIsPrimaryDevice(getState());

    dispatch(setSponsoringStep(sponsoring_steps.LINK_WAITING_V6));

    // TODO - do we need this here?:
    // ensure recent changes applied to the app info is applied
    // await dispatch(fetchApps(getGlobalNodeApi()));

    // TODO - do we need this here?:
    // generate blind sig for apps with no verification expiration at linking time
    // and also ensure blind sig is not missed because of delay in generation for all apps
    // await dispatch(updateBlindSig(appInfo));

    const vel = appInfo.verificationExpirationLength;
    const roundedTimestamp = vel ? Math.floor(Date.now() / vel) * vel : 0;

    // existing linked verifications
    const previousSigs = selectAllSigs(getState()).filter(
      (sig) =>
        sig.app === appId &&
        sig.linked === true &&
        sig.roundedTimestamp === roundedTimestamp,
    );
    // not yet linked verifications
    const sigs = selectAllSigs(getState()).filter(
      (sig) =>
        sig.app === appId &&
        sig.linked === false &&
        sig.roundedTimestamp === roundedTimestamp,
    );

    // make sure that always the same appUserId is used.
    if (previousSigs.length) {
      const previousAppUserIds: Set<string> = new Set();
      for (const previousSig of previousSigs) {
        if (previousSig.appUserId !== appUserId) {
          previousAppUserIds.add(previousSig.appUserId);
        }
      }
      if (previousAppUserIds.size) {
        if (!silent) {
          Alert.alert(
            i18next.t('apps.alert.title.linkingFailed'),
            i18next.t(
              'apps.alert.text.blindSigAlreadyLinkedDifferent',
              'You are trying to link with {{app}} using {{appUserId}}. You are already linked with {{app}} with different id {{previousAppUserIds}}. This may lead to problems using the app.',
              {
                app: appId,
                appUserId,
                previousAppUserIds: Array.from(previousAppUserIds).join(', '),
              },
            ),
          );
        }
        // don't link app when userId is different
        dispatch(setSponsoringStep(sponsoring_steps.LINK_ERROR));
        return;
      }

      // check if all app verifications are already linked
      const allVerificationsLinked = appInfo.verifications.every(
        (verification) => {
          for (const prevSig of previousSigs) {
            if (prevSig.verification === verification) return true;
          }
          return false;
        },
      );
      if (allVerificationsLinked) {
        if (!silent) {
          Alert.alert(
            i18next.t('apps.alert.title.linkingFailed'),
            i18next.t(
              'apps.alert.text.blindSigAlreadyLinked',
              'You are already linked with {{app}} with id {{appUserId}}',
              { app: appId, appUserId },
            ),
          );
        }
        // TODO: Is this really SUCCESS or rather ERROR?
        dispatch(setSponsoringStep(sponsoring_steps.LINK_SUCCESS));
        return;
      }
    }

    // get list of all missing verifications
    const missingVerifications = appInfo.verifications.filter(
      (verification) => {
        // exclude verification if it is already linked
        for (const prevSig of previousSigs) {
          if (prevSig.verification === verification) {
            console.log(
              `Verification ${verification} already linked with sig ${prevSig.uid}`,
            );
            return false;
          }
        }
        // exclude verification if not yet linked, but sig is available
        for (const sig of sigs) {
          if (sig.verification === verification) {
            console.log(
              `Verification ${verification} has sig available and ready to link`,
            );
            return false;
          }
        }
        console.log(`Verification ${verification} is missing`);
        return true;
      },
    );

    // get list of all already linked verifications
    const linkedVerifications = previousSigs.map((sig) => sig.verification);

    if (sigs.length === 0) {
      if (!silent) {
        Alert.alert(
          i18next.t('apps.alert.title.linkingFailed'),
          i18next.t(
            'apps.alert.text.missingBlindSig',
            'No blind sig found for app {{appId}}. Verifications missing: {{missingVerifications}}. Verifications already linked: {{linkedVerifications}}',
            {
              appId,
              missingVerifications: missingVerifications.join(),
              linkedVerifications: linkedVerifications.join(),
            },
          ),
          [
            {
              text: i18next.t('common.alert.dismiss'),
              style: 'cancel',
              onPress: () => null,
            },
          ],
        );
      }
      dispatch(setSponsoringStep(sponsoring_steps.LINK_ERROR));
      return;
    }

    // check if blind sigs are existing if this is a secondary device
    if (!isPrimary) {
      const missingSigs = sigs.filter((sig) => sig.sig === undefined);
      if (missingSigs.length) {
        if (!silent) {
          Alert.alert(
            i18next.t('apps.alert.title.notPrimary', 'Linking not possible'),
            i18next.t(
              'apps.alert.text.notPrimary',
              'You are currently using a secondary device. Linking app "{{app}}" requires interaction with your primary device. Please sync with your primary device or perform the linking with your primary device.',
              { app: `${appId}` },
            ),
          );
        }
        dispatch(setSponsoringStep(sponsoring_steps.LINK_ERROR));
        return;
      }
    }

    // Create temporary NodeAPI object, since the node at the specified nodeUrl will
    // be queried for the verification
    const network = __DEV__ ? BrightIdNetwork.TEST : BrightIdNetwork.NODE;
    const url = appInfo.nodeUrl || `http://${network}.brightid.org`;
    const api = new NodeApi({ url, id, secretKey });
    const linkedTimestamp = Date.now();
    let linkSuccess = false;
    for (const sig of sigs) {
      if (!sig.sig) {
        // ignore invalid signatures
        // eslint-disable-next-line no-continue
        continue;
      }
      try {
        await api.linkAppId(sig, appUserId);
        // mark sig as linked with app
        dispatch(
          updateSig({
            id: sig.uid,
            changes: { linked: true, linkedTimestamp, appUserId },
          }),
        );
        linkSuccess = true;
      } catch (err) {
        console.log(err);
        const msg = err instanceof Error ? err.message : err;
        if (!silent) {
          Alert.alert(
            i18next.t('apps.alert.title.linkingFailed'),
            i18next.t(
              'apps.alert.text.linkSigFailed',
              'Error linking verification {{verification}} to app {{appId}}. Error message: {{msg}}',
              { verification: sig.verification, appId, msg },
            ),
            [
              {
                text: i18next.t('common.alert.dismiss'),
                style: 'cancel',
                onPress: () => null,
              },
            ],
          );
        }
      }
    }

    if (linkSuccess) {
      // prepare success handler
      const onSuccess = async () => {
        if (appInfo.callbackUrl) {
          const api = create({
            baseURL: appInfo.callbackUrl,
          });
          await api.post('/', {
            network,
            appUserId,
          });
        }
      };

      if (!silent) {
        Alert.alert(
          i18next.t('apps.alert.title.linkSuccess'),
          i18next.t('apps.alert.text.linkSuccess', {
            context: appInfo.name,
          }),
        );
      }
      try {
        await onSuccess();
      } catch (e) {
        if (!silent) {
          Alert.alert(
            i18next.t(
              'apps.alert.title.callbackError',
              'Error while executing app callback',
            ),
            i18next.t(
              'apps.alert.text.callbackError',
              `App {{context}} reported an error: {{error}}`,
              {
                context: appInfo.name,
                error: (e as Error).message,
              },
            ),
          );
        }
      }
      dispatch(setSponsoringStep(sponsoring_steps.LINK_SUCCESS));
    } else {
      dispatch(setSponsoringStep(sponsoring_steps.LINK_ERROR));
    }
  };
