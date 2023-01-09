import { Alert } from 'react-native';
import { create } from 'apisauce';
import { t } from 'i18next';
import { getSponsorship } from '@/components/Apps/model';
import { getGlobalNodeApi } from '@/components/NodeApiGate';
import {
  addLinkedContext,
  selectAllSigs,
  selectAppInfoByAppId,
  selectLinkingAppError,
  selectLinkingAppInfo,
  selectApplinkingStep,
  setApps,
  setLinkingAppError,
  setLinkingAppInfo,
  setAppLinkingStep,
  setSponsorOperationHash,
  updateLinkedContext,
  updateSig,
  selectSigsUpdating,
  setSigsUpdating,
  selectSponsorOperationHash,
} from '@/reducer/appsSlice';
import {
  BrightIdNetwork,
  operation_states,
  SPONSOR_WAIT_TIME,
  SPONSORING_POLL_INTERVAL,
  app_linking_steps,
  UPDATE_BLIND_SIG_WAIT_TIME,
  OPERATION_TRACE_TIME,
} from '@/utils/constants';
import {
  addOperation,
  Operation,
  selectOperationByHash,
} from '@/reducer/operationsSlice';
import { NodeApi } from '@/api/brightId';
import {
  selectIsSponsored,
  setIsSponsoredv6,
  userSelector,
} from '@/reducer/userSlice';
import { selectIsPrimaryDevice, updateBlindSig } from '@/actions';

type requestLinkingParams = {
  linkingAppInfo: LinkingAppInfo;
  skipUserConfirmation?: boolean;
};
export const requestLinking =
  ({
    linkingAppInfo,
    skipUserConfirmation,
  }: requestLinkingParams): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    const appLinkingStep = selectApplinkingStep(getState());
    if (appLinkingStep !== app_linking_steps.IDLE) {
      console.log(
        `Can't request linking when not in IDLE state. Current state: ${appLinkingStep}`,
      );
      return;
    }
    const linkingError = selectLinkingAppError(getState());
    if (linkingError) {
      console.log(
        `Can't request linking when there is still an active error. Current error: ${linkingError}`,
      );
      return;
    }

    // store app linking details
    dispatch(setLinkingAppInfo(linkingAppInfo));
    const { appId, v } = linkingAppInfo;

    const api = getGlobalNodeApi();
    dispatch(setAppLinkingStep({ step: app_linking_steps.REFRESHING_APPS }));
    try {
      // make sure to have latest appInfo available
      const apps = await api.getApps();
      dispatch(setApps(apps));
    } catch (e) {
      const msg = e instanceof Error ? e.message : `${e}`;
      dispatch(setLinkingAppError(`Failed to fetch latest appInfo: ${msg}`));
      return;
    }

    // First check if provided data is valid
    const appInfo = selectAppInfoByAppId(getState(), appId);
    if (!appInfo) {
      // The app that should be linked was not found!
      dispatch(
        setLinkingAppError(
          t('apps.alert.text.invalidContext', {
            context: `${appId}`,
          }),
        ),
      );
      return;
    }

    if (v === 6 && !appInfo.usingBlindSig) {
      // v6 apps HAVE to use blind sigs!
      dispatch(
        setLinkingAppError(
          t('apps.alert.text.invalidApp', {
            app: `${appId}`,
          }),
        ),
      );
      return;
    }

    if (skipUserConfirmation) {
      dispatch(
        setAppLinkingStep({
          step: app_linking_steps.USER_CONFIRMED,
        }),
      );
      await dispatch(startLinking());
    } else {
      dispatch(
        setAppLinkingStep({
          step: app_linking_steps.WAITING_USER_CONFIRMATION,
        }),
      );
    }
  };

export const startLinking =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const applinkingStep = selectApplinkingStep(getState());
    if (applinkingStep !== app_linking_steps.USER_CONFIRMED) {
      console.log(
        `Can't start linkApp when not in USER_CONFIRMED state. Current state: ${applinkingStep}`,
      );
    }
    const isSponsored = selectIsSponsored(getState());
    const { skipSponsoring } = selectLinkingAppInfo(getState());

    if (isSponsored || skipSponsoring) {
      // trigger app linking
      dispatch(setAppLinkingStep({ step: app_linking_steps.SPONSOR_SUCCESS }));
      await dispatch(linkAppOrContext());
    } else {
      // trigger sponsoring workflow
      await dispatch(requestSponsoring());
    }
  };

export const linkAppOrContext =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const applinkingStep = selectApplinkingStep(getState());
    if (applinkingStep !== app_linking_steps.SPONSOR_SUCCESS) {
      console.log(
        `Can't start linkApp when not in SUCCESS state. Current state: ${applinkingStep}`,
      );
    }
    // sponsoring ok, now start linking.
    const { v } = selectLinkingAppInfo(getState());
    switch (v) {
      case 5:
        // v5 app
        await dispatch(linkContextId());
        break;
      case 6:
        // v6 app
        await dispatch(linkAppId());
        break;
      default:
        console.log(`Unhandled app version v: ${v}`);
        throw new Error(`Unhandled app version v: ${v}`);
    }
  };

export const requestSponsoring =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const applinkingStep = selectApplinkingStep(getState());
    if (applinkingStep !== app_linking_steps.USER_CONFIRMED) {
      console.log(
        `Can't request sponsoring when not in USER_CONFIRMED state. Current state: ${applinkingStep}`,
      );
      return;
    }

    const { appUserId, appId } = selectLinkingAppInfo(getState());
    // check if app provides sponsoring
    const appInfo = selectAppInfoByAppId(getState(), appId);
    if (!appInfo.sponsoring) {
      dispatch(
        setLinkingAppError(
          'You are not yet sponsored and this app is not providing sponsorships. Please ' +
            'find another app to sponsor you.',
        ),
      );
      return;
    }

    const api = getGlobalNodeApi();
    if (!api) {
      dispatch(
        setLinkingAppError(
          'No BrightID node API available. Please try again later.',
        ),
      );
      return;
    }

    // Check if sponsoring was already requested
    dispatch(
      setAppLinkingStep({ step: app_linking_steps.SPONSOR_PRECHECK_APP }),
    );
    const sp = await getSponsorship(appUserId, api);
    if (!sp || !sp.spendRequested) {
      // console.log(`Sending spend sponsorship op...`);
      const op = await api.spendSponsorship(appId, appUserId);
      // console.log(`Sponsor op hash: ${op.hash}`);
      dispatch(setSponsorOperationHash(op.hash));
      dispatch(addOperation(op));
      dispatch(
        setAppLinkingStep({ step: app_linking_steps.SPONSOR_WAITING_OP }),
      );
      dispatch(waitForSponsorOp());
    } else {
      // sponsoring was already requested, go to next step (waiting for sponsoring by app)
      dispatch(
        setAppLinkingStep({ step: app_linking_steps.SPONSOR_WAITING_APP }),
      );
      dispatch(waitForAppSponsoring());
    }
  };

export const waitForSponsorOp =
  (): AppThunk => (dispatch: AppDispatch, getState) => {
    const applinkingStep = selectApplinkingStep(getState());
    if (applinkingStep !== app_linking_steps.SPONSOR_WAITING_OP) {
      console.log(
        `Can't wait for sponsoring op when not in WAITING_OP state. Current state: ${applinkingStep}`,
      );
      return;
    }
    const sponsorOpHash = selectSponsorOperationHash(getState());
    if (!sponsorOpHash) {
      console.log(`Can't wait for sponsoring op - Op hash is not set`);
      return;
    }

    const startTime = Date.now();
    // Op to request sponsoring is submitted. Now wait for it to confirm.
    const intervalId = setInterval(async () => {
      const timeElapsed = Date.now() - startTime;
      const op = selectOperationByHash(getState(), sponsorOpHash);
      switch (op.state) {
        case operation_states.APPLIED:
          clearInterval(intervalId);
          dispatch(
            setAppLinkingStep({ step: app_linking_steps.SPONSOR_WAITING_APP }),
          );
          dispatch(waitForAppSponsoring());
          break;
        case operation_states.FAILED:
          clearInterval(intervalId);
          dispatch(setLinkingAppError('spend sponsor operation failed'));
          break;
        case operation_states.EXPIRED:
          clearInterval(intervalId);
          dispatch(setLinkingAppError('spend sponsor operation timed out'));
          break;
        case operation_states.UNKNOWN:
        case operation_states.INIT:
        case operation_states.SENT:
        default:
          // keep waiting until timeout
          if (timeElapsed > OPERATION_TRACE_TIME) {
            console.log(`Timeout waiting for sponsoring!`);
            clearInterval(intervalId);
            dispatch(setLinkingAppError('spend sponsor operation timed out'));
          }
          break;
      }
    }, SPONSORING_POLL_INTERVAL);
    // console.log(`Started pollSponsorOp ${intervalId}`);
  };

export const waitForAppSponsoring =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const applinkingStep = selectApplinkingStep(getState());
    if (applinkingStep !== app_linking_steps.SPONSOR_WAITING_APP) {
      console.log(
        `Can't wait for app sponsoring when not in WAITING_APP state. Current state: ${applinkingStep}`,
      );
      return;
    }

    const startTime = Date.now();
    const { appUserId } = selectLinkingAppInfo(getState());
    const api = getGlobalNodeApi();

    // Op to request sponsoring is confirmed. Now wait for app to actually sponsor me.
    const intervalId = setInterval(async () => {
      const timeElapsed = Date.now() - startTime;
      let sponsorshipInfo: SponsorshipInfo | undefined;
      let errorResponse;
      try {
        sponsorshipInfo = await getSponsorship(appUserId, api);
      } catch (error) {
        console.log(`Error getting sponsorship info:`);
        console.log(`${error}`);
        errorResponse = error;
      }
      if (sponsorshipInfo) {
        // console.log(`Got sponsorship info - Authorized: ${sponsorshipInfo.appHasAuthorized}, spendRequested: ${sponsorshipInfo.spendRequested}`);
        if (
          sponsorshipInfo.appHasAuthorized &&
          sponsorshipInfo.spendRequested
        ) {
          // console.log(`Sponsorship complete!`);
          clearInterval(intervalId);
          dispatch(
            setAppLinkingStep({ step: app_linking_steps.SPONSOR_SUCCESS }),
          );
          dispatch(setIsSponsoredv6(true));
          dispatch(linkAppOrContext());
        }
      }
      if (timeElapsed > SPONSOR_WAIT_TIME) {
        console.log(`Timeout waiting for sponsoring!`);
        clearInterval(intervalId);
        let lastResult;
        if (sponsorshipInfo) {
          lastResult = `Last poll result: "appHasAuthorized": "${sponsorshipInfo.appHasAuthorized}", "spendRequested": "${sponsorshipInfo.spendRequested}"`;
        } else if (errorResponse) {
          lastResult = `Error: "${errorResponse?.message || errorResponse}"`;
        } else {
          // no sponsorshipInfo but also no error
          lastResult = `Error: Node has not registered the sponsor request`;
        }
        dispatch(
          setLinkingAppError(`Timeout waiting for sponsoring!. ${lastResult}`),
        );
      }
    }, SPONSORING_POLL_INTERVAL);
    // console.log(`Started pollSponsorship ${intervalId}`);
  };

export const linkContextId =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const applinkingStep = selectApplinkingStep(getState());
    if (applinkingStep !== app_linking_steps.SPONSOR_SUCCESS) {
      console.log(
        `Can't start linkContext when not in SUCCESS state. Current state: ${applinkingStep}`,
      );
      return;
    }
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
      dispatch(setAppLinkingStep({ step: app_linking_steps.LINK_WAITING_V5 }));
    } catch (e) {
      dispatch(setLinkingAppError(`${(e as Error).message}`));
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
    result: any;
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
    const applinkingStep = selectApplinkingStep(getState());
    if (applinkingStep === app_linking_steps.LINK_WAITING_V5) {
      if (state === operation_states.APPLIED) {
        dispatch(setAppLinkingStep({ step: app_linking_steps.LINK_SUCCESS }));
      } else {
        const text = t('apps.alert.text.linkFailure', {
          context: `${op.context}`,
          result: `${result.message}`,
        });
        dispatch(setLinkingAppError(text));
      }
    }
  };

export const linkAppId =
  (): AppThunk<Promise<void>> => async (dispatch: AppDispatch, getState) => {
    const applinkingStep = selectApplinkingStep(getState());
    if (applinkingStep !== app_linking_steps.SPONSOR_SUCCESS) {
      console.log(
        `Can't start linkAppId when not in SPONSOR_SUCCESS state. Current state: ${applinkingStep}`,
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
    const sigsUpdating = selectSigsUpdating(getState());

    dispatch(setAppLinkingStep({ step: app_linking_steps.LINK_WAITING_V6 }));

    if (sigsUpdating) {
      console.log(`Waiting for updating sigs before linking...`);
      // Create promise that polls on sigsUpdating state and resolves once it is false.
      const sigsUpdatingPromise = new Promise<void>((resolve, reject) => {
        const waitingStartTime = Date.now();
        const intervalId = setInterval(() => {
          const timeElapsed = Date.now() - waitingStartTime;
          const stillUpdating = selectSigsUpdating(getState());
          if (!stillUpdating) {
            console.log(`blindSigs update finished! Continue with linking...`);
            clearInterval(intervalId);
            resolve();
          }
          if (timeElapsed > UPDATE_BLIND_SIG_WAIT_TIME) {
            clearInterval(intervalId);
            reject(new Error(`Timeout waiting for sigsUpdating to finish!`));
          } else {
            console.log(
              `Still waiting for sigsUpdating to finish. Time elapsed: ${timeElapsed}ms`,
            );
          }
        }, 500);
      });

      try {
        await sigsUpdatingPromise;
      } catch (e) {
        dispatch(
          setLinkingAppError(`Timeout waiting for update of blind sigs!`),
        );
        return;
      }

      // double-check app is still in linking workflow
      const currentStep = selectApplinkingStep(getState());
      if (currentStep !== app_linking_steps.SPONSOR_SUCCESS) {
        console.log(
          `Can't continue linkAppId when not in SPONSOR_SUCCESS state. Current state: ${applinkingStep}`,
        );
        return;
      }
    } else {
      dispatch(setSigsUpdating(true));
      // generate blind sig for apps with no verification expiration at linking time
      // and also ensure blind sig is not missed because of delay in generation for all apps
      await dispatch(updateBlindSig(appInfo));
      dispatch(setSigsUpdating(false));
    }

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
        dispatch(setLinkingAppError(text));
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
          setAppLinkingStep({ step: app_linking_steps.LINK_SUCCESS, text }),
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
          linkedVerifications: linkedVerifications.join() || 'None',
        },
      );
      dispatch(setLinkingAppError(text));
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
        dispatch(setLinkingAppError(text));
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
      // TODO If there were errors with other verifications (sigErrors array), how to show in the UI?
      dispatch(setAppLinkingStep({ step: app_linking_steps.LINK_SUCCESS }));

      if (appInfo.callbackUrl) {
        const onSuccess = async () => {
          const api = create({
            baseURL: appInfo.callbackUrl,
          });
          await api.post('/', {
            network,
            appUserId,
          });
        };

        try {
          await onSuccess();
        } catch (e) {
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
    } else {
      // No verification could be linked
      const text = sigErrors.join(`, `);
      dispatch(setLinkingAppError(text));
    }
  };
