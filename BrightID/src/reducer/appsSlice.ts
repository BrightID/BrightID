import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit';
import { find, propEq } from 'ramda';
import { RESET_STORE } from '@brightid/redux/actions';
import { app_linking_steps } from '@/utils/constants';

/* ******** INITIAL STATE ************** */

const linkedContextsAdapter = createEntityAdapter<ContextInfo>({
  selectId: (linkedContext) => linkedContext.contextId,
});

const sigsAdapter = createEntityAdapter<SigInfo>({
  selectId: (sig) => `${sig.uid}`,
});

export const initialAppsState: AppsState = {
  apps: [],
  linkedContexts: linkedContextsAdapter.getInitialState(),
  sigs: sigsAdapter.getInitialState(),
  sigsUpdating: false,
  appLinkingStep: app_linking_steps.IDLE,
  appLinkingStepText: undefined,
  linkingAppInfo: undefined,
  sponsorOperationHash: undefined,
  linkingAppError: undefined,
};

const appsSlice = createSlice({
  name: 'apps',
  initialState: initialAppsState,
  reducers: {
    setApps(state, action: PayloadAction<AppInfo[]>) {
      state.apps = action.payload;
    },
    addLinkedContext(state, action: PayloadAction<ContextInfo>) {
      state.linkedContexts = linkedContextsAdapter.addOne(
        state.linkedContexts,
        action,
      );
    },
    removeLinkedContext(state, action: PayloadAction<string>) {
      state.linkedContexts = linkedContextsAdapter.removeOne(
        state.linkedContexts,
        action,
      );
    },
    updateLinkedContext(state, action: PayloadAction<Partial<ContextInfo>>) {
      const update: Update<ContextInfo> = {
        id: action.payload.contextId,
        changes: action.payload,
      };
      state.linkedContexts = linkedContextsAdapter.updateOne(
        state.linkedContexts,
        update,
      );
    },
    upsertSig(state, action: PayloadAction<SigInfo>) {
      state.sigs = sigsAdapter.upsertOne(state.sigs, action);
    },
    removeSig(state, action: PayloadAction<string>) {
      state.sigs = sigsAdapter.removeOne(state.sigs, action);
    },
    removeAllSigs(state) {
      state.sigs = sigsAdapter.removeAll(state.sigs);
    },
    updateSig(state, action: PayloadAction<Update<SigInfo>>) {
      state.sigs = sigsAdapter.updateOne(state.sigs, action.payload);
    },
    setSigsUpdating(state, action: PayloadAction<boolean>) {
      state.sigsUpdating = action.payload;
    },
    setAppLinkingStep(
      state,
      action: PayloadAction<{ step: AppLinkingStep_Type; text?: string }>,
    ) {
      const { step, text } = action.payload;
      state.appLinkingStep = step;
      state.appLinkingStepText = text;
    },
    setLinkingAppInfo(
      state,
      action: PayloadAction<LinkingAppInfo | undefined>,
    ) {
      state.linkingAppInfo = action.payload;
    },
    setSponsorOperationHash(state, action: PayloadAction<string>) {
      state.sponsorOperationHash = action.payload;
    },
    setLinkingAppError(state, action: PayloadAction<string>) {
      state.linkingAppError = action.payload;
    },
    resetLinkingAppState(state) {
      state.appLinkingStep = app_linking_steps.IDLE;
      state.appLinkingStepText = undefined;
      state.linkingAppInfo = undefined;
      state.sponsorOperationHash = undefined;
      state.linkingAppError = undefined;
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialAppsState;
    },
  },
});

// Export app actions
export const {
  setApps,
  addLinkedContext,
  removeLinkedContext,
  updateLinkedContext,
  upsertSig,
  removeSig,
  removeAllSigs,
  updateSig,
  setSigsUpdating,
  setAppLinkingStep,
  setLinkingAppInfo,
  setSponsorOperationHash,
  resetLinkingAppState,
  setLinkingAppError,
} = appsSlice.actions;

export const {
  selectById: selectLinkedContextById,
  selectAll: selectAllLinkedContexts,
} = linkedContextsAdapter.getSelectors(
  (state: RootState) => state.apps.linkedContexts,
);

export const { selectAll: selectAllSigs } = sigsAdapter.getSelectors(
  (state: RootState) => state.apps.sigs,
);

export const linkedContextTotal = createSelector(
  selectAllLinkedContexts,
  (contexts) =>
    contexts.reduce(
      (acc, link) => (link.state === 'applied' ? acc + 1 : acc),
      0,
    ),
);

export const selectLinkedContext = createSelector(
  selectAllLinkedContexts,
  (_: RootState, context: string) => context,
  (contexts, context) => contexts.find((link) => link.context === context),
);

export const selectPendingLinkedContext = createSelector(
  selectAllLinkedContexts,
  (contexts) => contexts.find((link) => link.state === 'pending'),
);

export const selectAllApps = (state: RootState) => state.apps.apps;

export const selectAllLinkedSigs = createSelector(selectAllSigs, (sigs) =>
  sigs.filter((sig) => sig.linked),
);

export const createSelectLinkedSigsForApp = (appId) =>
  createSelector(selectAllLinkedSigs, (linkedSigs) => {
    // return all linked sigs that belong to provided app
    return linkedSigs.filter((sig) => sig.app === appId);
  });

export const selectBlindSigApps = (state: RootState) =>
  state.apps.apps.filter((app) => app.usingBlindSig);

export const selectExpireableBlindSigApps = createSelector(
  selectBlindSigApps,
  (apps) =>
    apps.filter((app) => app.verificationExpirationLength && !app.testing),
);

export const selectApplinkingStep = (state: RootState) =>
  state.apps.appLinkingStep;

export const selectApplinkingStepText = (state: RootState) =>
  state.apps.appLinkingStepText;

export const selectLinkingAppInfo = (state: RootState) =>
  state.apps.linkingAppInfo;

export const selectSponsorOperationHash = (state: RootState) =>
  state.apps.sponsorOperationHash;

export const selectLinkingAppError = (state: RootState) =>
  state.apps.linkingAppError;

export const selectSigsUpdating = (state: RootState) => state.apps.sigsUpdating;

// look up app info. Legacy apps send 'context' in the deep link but soulbound
// apps send 'id', so look in both places
export const selectAppInfoByAppId = createSelector(
  selectAllApps,
  (_: RootState, appId: string) => appId,
  (apps, appId) =>
    (find(propEq('id', appId))(apps) as AppInfo) ||
    (find(propEq('context', appId))(apps) as AppInfo),
);

// Export reducer
export default appsSlice.reducer;
