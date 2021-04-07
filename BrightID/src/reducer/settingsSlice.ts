import { createSlice, PayloadAction } from '@reduxjs/toolkit';

let seedUrl = 'http://node.brightid.org';
if (__DEV__) {
  seedUrl = 'http://test.brightid.org';
}

interface SettingsSlice {
  baseUrl: string;
}

const initialState: SettingsSlice = {
  baseUrl: seedUrl,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setBaseUrl: (state, action: PayloadAction<string>) => {
      state.baseUrl = action.payload;
    },
    resetSettings: (state) => {
      state = initialState;
    },
  },
});

export const { setBaseUrl, resetSettings } = settingsSlice.actions;

export const selectBaseUrl = (state: State) => {
  return state.settings.baseUrl;
};

export default settingsSlice.reducer;
