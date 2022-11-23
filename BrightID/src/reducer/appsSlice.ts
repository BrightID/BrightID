import {
  createSelector,
  createSlice,
  createEntityAdapter,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

/* ******** INITIAL STATE ************** */

const linkedContextsAdapter = createEntityAdapter<ContextInfo>({
  selectId: (linkedContext) => linkedContext.contextId,
});

const sigsAdapter = createEntityAdapter<SigInfo>({
  selectId: (sig) => `${sig.uid}`,
});

const initialState: AppsState = {
  apps: [],
  linkedContexts: linkedContextsAdapter.getInitialState(),
  sigs: sigsAdapter.getInitialState(),
  sigsUpdating: false,
};

const appsSlice = createSlice({
  name: 'apps',
  initialState,
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
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialState;
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

// Export reducer
export default appsSlice.reducer;
