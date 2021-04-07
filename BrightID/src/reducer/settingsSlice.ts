import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NodeApi } from '@/api/brightId';

let seedUrl = 'http://node.brightid.org';
if (__DEV__) {
  seedUrl = 'http://test.brightid.org';
}

interface SettingsSlice {
  baseUrl: string;
  api: NodeApi | undefined;
}

const initialState: SettingsSlice = {
  baseUrl: seedUrl,
  api: undefined,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setBaseUrl: (state, action: PayloadAction<string>) => {
      state.baseUrl = action.payload;
    },
    setApiInstance: (state, action: PayloadAction<NodeApi>) => {
      state.api = action.payload;
    },
    resetSettings: (state) => {
      state = initialState;
    },
  },
});

export const {
  setBaseUrl,
  resetSettings,
  setApiInstance,
} = settingsSlice.actions;

export const selectBaseUrl = (state: State) => {
  return state.settings.baseUrl;
};
export const selectNodeApi = (state: State) => {
  return state.settings.api;
};

export const setBaseUrlThunk = (newBaseUrl: string) => async (
  dispatch,
  getState,
) => {
  try {
    // TODO: Check if url is actually working

    const api = selectNodeApi(getState);
    if (api) {
      api.baseUrl = newBaseUrl;
    }
    dispatch(setBaseUrl(newBaseUrl));
  } catch (e) {
    console.log(`Failed to set baseUrl ${newBaseUrl}: ${e.message}`);
  }
};

export const initApiThunk = () => async (dispatch, getState) => {
  const { id } = getState().user;
  const { secretKey } = getState().keypair;
  const url = getState().settings.baseUrl;
  try {
    const apiInstance = new NodeApi({ url, id, secretKey });
    dispatch(setApiInstance(apiInstance));
  } catch (e) {
    console.log(`Failed to initialize API: ${e.message}`);
  }
};

export default settingsSlice.reducer;
