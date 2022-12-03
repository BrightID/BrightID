import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

const ProdCandidates = [
  'http://node.brightid.org',
  'http://brightid.idealmoney.io',
  'http://brightid2.idealmoney.io',
  'https://brightid.59836e71dd6e5898.dyndns.dappnode.io',
  'http://bright.daosquare.io',
  'https://brightid.clr.fund',
  'https://aura-node.brightid.org',
  'https://aura-test.brightid.org',
  // Following nodes exist, but currently fail the NodeChooser tests
  //  'http://brightid.onehive.org',
  //  'http://node.topupgifter.com',
  //  'http://node.lumos.services',
];
const TestCandidates = ['http://test.brightid.org'];

interface SettingsSlice {
  syncSocialMediaEnabled: boolean;
  baseUrl: string | null;
  nodeUrls: Array<string>;
  isPrimaryDevice: boolean;
  lastSyncTime: number;
  languageTag: string | null;
}

const initialState: SettingsSlice = {
  syncSocialMediaEnabled: undefined,
  baseUrl: null,
  nodeUrls: __DEV__ ? TestCandidates : ProdCandidates,
  isPrimaryDevice: true,
  lastSyncTime: 0,
  languageTag: null,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSyncSocialMediaEnabled: (state, action: PayloadAction<boolean>) => {
      state.syncSocialMediaEnabled = action.payload;
    },
    setBaseUrl: (state, action: PayloadAction<string>) => {
      state.baseUrl = action.payload;
    },
    clearBaseUrl: (state) => {
      state.baseUrl = null;
    },
    resetSettings: (state) => {
      state = initialState;
    },
    addNodeUrl: (state, action: PayloadAction<string>) => {
      const newNodeUrl = action.payload.toLowerCase();
      if (!state.nodeUrls.includes(newNodeUrl))
        state.nodeUrls.push(action.payload);
    },
    removeNodeUrl: (state, action: PayloadAction<string>) => {
      const removeUrl = action.payload.toLowerCase();
      state.nodeUrls = state.nodeUrls.filter(
        (url) => url.toLowerCase() !== removeUrl,
      );
      if (state.baseUrl.toLowerCase() === removeUrl) {
        state.baseUrl = null;
      }
    },
    removeCurrentNodeUrl: (state) => {
      if (state.baseUrl) {
        console.log(`Removing active node ${state.baseUrl}`);
        state.nodeUrls = state.nodeUrls.filter(
          (url) => url.toLowerCase() !== state.baseUrl,
        );
        state.baseUrl = null;
      } else {
        console.log(`No active node to remove`);
      }
    },
    resetNodeUrls: (state) => {
      console.log(`Resetting node urls`);
      state.nodeUrls = initialState.nodeUrls;
      if (state.baseUrl && !state.nodeUrls.includes(state.baseUrl)) {
        console.log(`current baseUrl removed from nodeList. Clearing baseUrl.`);
        state.baseUrl = initialState.baseUrl;
      }
    },
    setPrimaryDevice: (state, action: PayloadAction<boolean>) => {
      state.isPrimaryDevice = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload;
    },
    setLanguageTag: (state, action: PayloadAction<string>) => {
      state.languageTag = action.payload;
    },
    resetLanguageTag: (state) => {
      state.languageTag = initialState.languageTag;
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialState;
    },
  },
});

export const {
  setSyncSocialMediaEnabled,
  setBaseUrl,
  clearBaseUrl,
  resetSettings,
  addNodeUrl,
  removeNodeUrl,
  removeCurrentNodeUrl,
  resetNodeUrls,
  setPrimaryDevice,
  setLastSyncTime,
  setLanguageTag,
  resetLanguageTag,
} = settingsSlice.actions;

export const selectSyncSocialMediaEnabled = (state: RootState): boolean =>
  !!state.settings.syncSocialMediaEnabled;
export const selectBaseUrl = (state: RootState) => state.settings.baseUrl;
export const selectAllNodeUrls = (state: RootState) => state.settings.nodeUrls;
export const selectDefaultNodeUrls = (_: RootState) => initialState.nodeUrls;
export const selectIsPrimaryDevice = (state: RootState) =>
  state.settings.isPrimaryDevice;
export const selectLastSyncTime = (state: RootState) =>
  state.settings.lastSyncTime;
export const selectLanguageTag = (state: RootState) =>
  state.settings.languageTag;

export default settingsSlice.reducer;
