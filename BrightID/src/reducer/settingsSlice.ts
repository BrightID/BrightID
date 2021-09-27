import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

interface SettingsSlice {
  baseUrl: string | null;
}

const initialState: SettingsSlice = {
  baseUrl: null,
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
  },
});

export const {
  setBaseUrl,
  clearBaseUrl,
  resetSettings,
} = settingsSlice.actions;

export const selectBaseUrl = (state: RootState) => {
  return state.settings.baseUrl;
};

export default settingsSlice.reducer;
