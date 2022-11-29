import { Alert } from 'react-native';
import { create } from 'apisauce';
import { find, propEq } from 'ramda';
import { t } from 'i18next';
import { getSponsorship } from '@/components/Apps/model';
import { getGlobalNodeApi } from '@/components/NodeApiGate';
import {
  addLinkedContext,
  selectAllApps,
  selectAllSigs,
  selectAppInfoByAppId,
  selectLinkingAppInfo,
  selectSponsoringStep,
  setApps,
  setLinkingAppInfo,
  setLinkingAppStarttime,
  setSponsoringStep,
  setSponsorOperationHash,
  updateLinkedContext,
  updateSig,
} from '@/reducer/appsSlice';
import {
  BrightIdNetwork,
  operation_states,
  SPONSOR_WAIT_TIME,
  SPONSORING_POLL_INTERVAL,
  sponsoring_steps,
} from '@/utils/constants';
import { addOperation, Operation } from '@/reducer/operationsSlice';
import { NodeApi } from '@/api/brightId';
import {
  selectIsSponsored,
  setIsSponsoredv6,
  userSelector,
} from '@/reducer/userSlice';
import { selectIsPrimaryDevice, updateBlindSig } from '@/actions';

type requestLinkingParams = {
  appId: string;
  appUserId: string;
  baseUrl?: string;
  v: number;
};
export const requestLinking =
  (params: requestLinkingParams): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    const sponsoringStep = selectSponsoringStep(getState());
    if (sponsoringStep !== sponsoring_steps.IDLE) {
      console.log(
        `Can't start linking when not in IDLE state. Current state: ${sponsoringStep}`,
      );
      return;
    }

    // store app linking details
    dispatch(setLinkingAppInfo(params));

    const api = getGlobalNodeApi();
    dispatch(setSponsoringStep({ step: sponsoring_steps.REFRESHING_APPS }));
    try {
      // make sure to have latest appInfo available
      const apps = await api.getApps();
      dispatch(setApps(apps));
    } catch (e) {
      dispatch(
        setSponsoringStep({
          step: sponsoring_steps.ERROR_OP,
          text: 'Failed to fetch latest appInfo',
        }),
      );
    }

    // First check if provided data is valid
    const appInfo = selectAppInfoByAppId(getState(), params.appId);
    if (!appInfo) {
      // The app that should be linked was not found!
      dispatch(
        setSponsoringStep({
          step: sponsoring_steps.ERROR_OP,
          text: t('apps.alert.text.invalidContext', {
            context: `${params.appId}`,
          }),
        }),
      );
      return;
    }

    if (params.v === 6 && !appInfo.usingBlindSig) {
      // v6 apps HAVE to use blind sigs!
      setSponsoringStep({
        step: sponsoring_steps.ERROR_OP,
        text: t('apps.alert.text.invalidApp', {
          app: `${params.appId}`,
        }),
      });
      return;
    }

    // request user confirmation
    dispatch(
      setSponsoringStep({ step: sponsoring_steps.WAITING_USER_CONFIRMATION }),
    );
  };

export const startLinking =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const isSponsored = selectIsSponsored(getState());
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
      dispatch(setSponsoringStep({ step: sponsoring_steps.SUCCESS }));
      dispatch(linkAppOrContext());
    }
  };

export const linkAppOrContext =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const sponsoringStep = selectSponsoringStep(getState());
    if (sponsoringStep !== sponsoring_steps.SUCCESS) {
      console.log(
        `Can't start linkApp when not in SUCCESS state. Current state: ${sponsoringStep}`,
      );
    }
    // TODO How to handle below condition?
    /*
     if (sigsUpdating) {
     console.log(`Waiting for updating sigs before linking...`);
     return;
     }
     */
    // sponsoring ok, now start linking.
    const { v } = selectLinkingAppInfo(getState());
    switch (v) {
      case 5:
        // v5 app
        dispatch(linkContextId());
        break;
      case 6:
        // v6 app
        dispatch(linkAppId({ silent: false }));
        break;
      default:
        console.log(`Unhandled app version v: ${v}`);
        throw new Error(`Unhandled app version v: ${v}`);
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
    dispatch(setSponsoringStep({ step: sponsoring_steps.PRECHECK_APP }));
    const sp = await getSponsorship(appUserId, api);
    if (!sp || !sp.spendRequested) {
      console.log(`Sending spend sponsorship op...`);
      const op = await api.spendSponsorship(appId, appUserId);
      dispatch(addOperation(op));
      dispatch(setSponsoringStep({ step: sponsoring_steps.WAITING_OP }));
      return op.hash;
    } else {
      // sponsoring was already requested, go to next step (waiting for sponsoring by app)
      dispatch(setSponsoringStep({ step: sponsoring_steps.WAITING_APP }));
      dispatch(waitForAppSponsoring());
    }
  };

export const waitForAppSponsoring =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const sponsoringStep = selectSponsoringStep(getState());
    if (sponsoringStep !== sponsoring_steps.WAITING_APP) {
      console.log(
        `Can't wait for app sponsoring when not in WAITING_APP state. Current state: ${sponsoringStep}`,
      );
    }

    const linkingAppStarttime = Date.now();
    dispatch(setLinkingAppStarttime(linkingAppStarttime));
    const { appUserId } = selectLinkingAppInfo(getState());
    const api = getGlobalNodeApi();

    // Op to request sponsoring is submitted. Now wait for app to actually perform it.
    const intervalId = setInterval(async () => {
      const timeElapsed = Date.now() - linkingAppStarttime;
      let sponsorshipInfo: SponsorshipInfo | undefined;
      try {
        sponsorshipInfo = await getSponsorship(appUserId, api);
      } catch (error) {
        console.log(`Error getting sponsorship info:`);
        console.log(`${error}`);
      }
      if (sponsorshipInfo) {
        console.log(
          `Got sponsorship info - Authorized: ${sponsorshipInfo.appHasAuthorized}, spendRequested: ${sponsorshipInfo.spendRequested}`,
        );
        if (
          sponsorshipInfo.appHasAuthorized &&
          sponsorshipInfo.spendRequested
        ) {
          console.log(`Sponsorship complete!`);
          clearInterval(intervalId);
          dispatch(setSponsoringStep({ step: sponsoring_steps.SUCCESS }));
          dispatch(setIsSponsoredv6(true));
          dispatch(linkAppOrContext());
        }
      }
      if (timeElapsed > SPONSOR_WAIT_TIME) {
        console.log(`Timeout waiting for sponsoring!`);
        clearInterval(intervalId);
        dispatch(setSponsoringStep({ step: sponsoring_steps.ERROR_APP }));
      }
    }, SPONSORING_POLL_INTERVAL);
    console.log(`Started pollSponsorship ${intervalId}`);
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
        dispatch(setSponsoringStep({ step: sponsoring_steps.WAITING_APP }));
        dispatch(waitForAppSponsoring());
        break;
      case operation_states.FAILED:
        dispatch(
          setSponsoringStep({
            step: sponsoring_steps.ERROR_OP,
            text: 'spend sponsor operation failed',
          }),
        );
        break;
      case operation_states.EXPIRED:
        dispatch(
          setSponsoringStep({
            step: sponsoring_steps.ERROR_OP,
            text: 'spend sponsor operation timed out',
          }),
        );
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
    dispatch(setSponsoringStep({ step: sponsoring_steps.LINK_WAITING_V5 }));
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
      setSponsoringStep({
        step: sponsoring_steps.LINK_ERROR,
        text: `${(e as Error).message}`,
      });
    }
  };

export const handleLinkContextOpUpdate =
  ({
    op,
    state,
    result,
  }: {
    op: Operation;
    state: OperationStateType;
    result: string;
  }): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    // make sure this is only called with the correct operation
    if (op.name !== 'Link ContextId') {
      return;
    }

    dispatch(
      updateLinkedContext({
        context: op.context,
        contextId: op.contextId,
        state,
      }),
    );

    // Update local state only if UI is in app linking workflow and waiting for the operation.
    // The operation update might come in anytime when the app is not in the linking workflow
    const sponsoringStep = selectSponsoringStep(getState());
    if (sponsoringStep === sponsoring_steps.LINK_WAITING_V5) {
      if (state === operation_states.APPLIED) {
        dispatch(setSponsoringStep({ step: sponsoring_steps.LINK_SUCCESS }));
      } else {
        const text = t('apps.alert.text.linkFailure', {
          context: `${op.context}`,
          result: `${result}`,
        });
        dispatch(
          setSponsoringStep({ step: sponsoring_steps.LINK_ERROR, text }),
        );
      }
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
    const { appId, appUserId } = selectLinkingAppInfo(getState());
    const appInfo = selectAppInfoByAppId(getState(), appId);
    const isPrimary = selectIsPrimaryDevice(getState());

    dispatch(setSponsoringStep({ step: sponsoring_steps.LINK_WAITING_V6 }));

    // generate blind sig for apps with no verification expiration at linking time
    // and also ensure blind sig is not missed because of delay in generation for all apps
    await dispatch(updateBlindSig(appInfo));

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
        // don't link app when userId is different
        const text = t(
          'apps.alert.text.blindSigAlreadyLinkedDifferent',
          'You are trying to link with {{app}} using {{appUserId}}. You are already linked with {{app}} with different id {{previousAppUserIds}}. This may lead to problems using the app.',
          {
            app: appInfo.name,
            appUserId,
            previousAppUserIds: Array.from(previousAppUserIds).join(', '),
          },
        );
        dispatch(
          setSponsoringStep({ step: sponsoring_steps.LINK_ERROR, text }),
        );
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
        const text = t(
          'apps.alert.text.blindSigAlreadyLinked',
          'You are already linked with {{app}} with id {{appUserId}}',
          {
            app: appInfo.name,
            appUserId,
          },
        );
        dispatch(
          setSponsoringStep({ step: sponsoring_steps.LINK_SUCCESS, text }),
        );
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
      const text = t(
        'apps.alert.text.missingBlindSig',
        'No blind sig found for app {{appId}}. Verifications missing: {{missingVerifications}}. Verifications already linked: {{linkedVerifications}}',
        {
          appId: appInfo.name,
          missingVerifications: missingVerifications.join(),
          linkedVerifications: linkedVerifications.join(),
        },
      );
      dispatch(setSponsoringStep({ step: sponsoring_steps.LINK_ERROR, text }));
      return;
    }

    // check if blind sigs are existing if this is a secondary device
    if (!isPrimary) {
      const missingSigs = sigs.filter((sig) => sig.sig === undefined);
      if (missingSigs.length) {
        const text = t(
          'apps.alert.text.notPrimary',
          'You are currently using a secondary device. Linking app "{{app}}" requires interaction with your primary device. Please sync with your primary device or perform the linking with your primary device.',
          { app: appInfo.name },
        );
        dispatch(
          setSponsoringStep({ step: sponsoring_steps.LINK_ERROR, text }),
        );
        return;
      }
    }

    // Create temporary NodeAPI object, since the node at the specified nodeUrl will
    // be queried for the verification
    const network = __DEV__ ? BrightIdNetwork.TEST : BrightIdNetwork.NODE;
    const url = appInfo.nodeUrl || `http://${network}.brightid.org`;
    const api = new NodeApi({ url, id, secretKey });
    const linkedTimestamp = Date.now();
    const sigErrors = [];
    let linkSuccess = false;
    for (const sig of sigs) {
      if (!sig.sig) {
        // ignore invalid signatures
        sigErrors.push(
          `Error linking verification ${sig.verification}. Blind sig is missing.`,
        );
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
        const text = t(
          'apps.alert.text.linkSigFailed',
          'Error linking verification {{verification}} to app {{appId}}. Error message: {{msg}}',
          { verification: sig.verification, appId: appInfo.name, msg },
        );
        sigErrors.push(text);
      }
    }

    if (linkSuccess) {
      // at least one verification successfully linked
      const text = t('apps.alert.text.linkSuccess', {
        context: appInfo.name,
      });
      // TODO If there were errors with other verifications (sigErrors array), how to show in the UI?
      dispatch(
        setSponsoringStep({ step: sponsoring_steps.LINK_SUCCESS, text }),
      );

      if (appInfo.callbackUrl) {
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

        try {
          await onSuccess();
        } catch (e) {
          if (!silent) {
            Alert.alert(
              t(
                'apps.alert.title.callbackError',
                'Error while executing app callback',
              ),
              t(
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
      }
    } else {
      // No verification could be linked
      const text = sigErrors.join(`, `);
      dispatch(setSponsoringStep({ step: sponsoring_steps.LINK_ERROR, text }));
    }
  };
