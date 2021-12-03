import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: SettingsSlice = {
  baseUrl: null,
  nodeUrls: __DEV__ ? TestCandidates : ProdCandidates,
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
    resetNodeUrls: (state) => {
      console.log(`Resetting node urls`);
      state.nodeUrls = initialState.nodeUrls;
      if (state.baseUrl && !state.nodeUrls.includes(state.baseUrl)) {
        console.log(`current baseUrl removed from nodeList. Clearing baseUrl.`);
        state.baseUrl = initialState.baseUrl;
      }
    },
  },
});

export const {
  setBaseUrl,
  clearBaseUrl,
  resetSettings,
  addNodeUrl,
  removeNodeUrl,
  resetNodeUrls,
} = settingsSlice.actions;

export const selectBaseUrl = (state: State) => state.settings.baseUrl;
export const selectAllNodeUrls = (state: State) => state.settings.nodeUrls;
export const selectDefaultNodeUrls = (_: State) => initialState.nodeUrls;

export default settingsSlice.reducer;
