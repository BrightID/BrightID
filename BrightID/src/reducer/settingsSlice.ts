import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

const ProdCandidates = [
  'http://node.brightid.org',
  'http://brightid.idealmoney.io',
  'http://brightid2.idealmoney.io',
  'https://brightid.59836e71dd6e5898.dyndns.dappnode.io',
  'http://bright.daosquare.io',
  // Following nodes exist, but currently fail the NodeChooser tests
  //  'http://brightid.onehive.org',
  //  'http://node.topupgifter.com',
  //  'http://node.lumos.services',
];
const TestCandidates = ['http://test.brightid.org'];

interface SettingsSlice {
  baseUrl: string | null;
  nodeUrls: Array<string>;
  isPrimaryDevice: boolean;
  lastSyncTime: number;
}

const initialState: SettingsSlice = {
  baseUrl: null,
  nodeUrls: __DEV__ ? TestCandidates : ProdCandidates,
  isPrimaryDevice: true,
  lastSyncTime: 0,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
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
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialState;
    },
  },
});

export const {
  setBaseUrl,
  clearBaseUrl,
  resetSettings,
  addNodeUrl,
  removeNodeUrl,
  removeCurrentNodeUrl,
  resetNodeUrls,
  setPrimaryDevice,
  setLastSyncTime,
} = settingsSlice.actions;

export const selectBaseUrl = (state: State) => state.settings.baseUrl;
export const selectAllNodeUrls = (state: State) => state.settings.nodeUrls;
export const selectDefaultNodeUrls = (_: State) => initialState.nodeUrls;
export const selectIsPrimaryDevice = (state: State) =>
  state.settings.isPrimaryDevice;
export const selectLastSyncTime = (state: State) => state.settings.lastSyncTime;

export default settingsSlice.reducer;
