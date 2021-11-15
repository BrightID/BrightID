import {
  createSelector,
  createSlice,
  createEntityAdapter,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';
import { createDeepEqualSelector } from '@/utils/createDeepEqualStringArraySelector';

/* ******** INITIAL STATE ************** */

const linkedContextsAdapter = createEntityAdapter<ContextInfo>({
  selectId: (linkedContext) => linkedContext.contextId,
});

const sigsAdapter = createEntityAdapter<SigInfo>({
  selectId: (sig) => `${sig.app}_${sig.verification}`,
});

const initialState: AppsState = {
  apps: [],
  linkedContexts: linkedContextsAdapter.getInitialState(),
  sigs: sigsAdapter.getInitialState(),
};

const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    setApps(state, action: PayloadAction<AppInfo[]>) {
      state.apps = action.payload;
      /*
      // Workaround until `verification` is removed from server response: Manually fill `verifications`
      state.apps.forEach((app) => {
        if (app.verifications === undefined) {
          console.log(`adding verifications array to app ${app.name}`);
          app.verifications = [];
        }
        if (app.verifications.length === 0 && app.verification !== '')
          app.verifications.push(app.verification);
      });
       */
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
    addSig(state, action: PayloadAction<SigInfo>) {
      state.sigs = sigsAdapter.addOne(
        state.sigs,
        action,
      );
    },
    removeAllSigs(state) {
      state.sigs = sigsAdapter.removeAll(
        state.sigs,
      );
    },
    updateSig(state, action: PayloadAction<Partial<SigInfo>>) {
      const update: Update<SigInfo> = {
        id: `${action.payload.app}_${action.payload.verification}`,
        changes: action.payload,
      };
      state.sigs = sigsAdapter.updateOne(
        state.sigs,
        update,
      );
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
  addSig,
  removeAllSigs,
  updateSig,
} = appsSlice.actions;

export const {
  selectById: selectLinkedContextById,
  selectAll: selectAllLinkedContexts,
} = linkedContextsAdapter.getSelectors(
  (state: State) => state.apps.linkedContexts,
);

export const {
  selectAll: selectAllSigs,
} = sigsAdapter.getSelectors(
  (state: State) => state.apps.sigs,
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
  (_: State, context: string) => context,
  (contexts, context) => contexts.find((link) => link.context === context),
);

export const selectPendingLinkedContext = createSelector(
  selectAllLinkedContexts,
  (contexts) => contexts.find((link) => link.state === 'pending'),
);

export const selectAllApps = ((state: State) => state.apps.apps);

// Export reducer
export default appsSlice.reducer;
