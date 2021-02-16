import { createSlice } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

const initialState: KeyPair = {
  publicKey: '',
  secretKey: new Uint8Array(),
};

const keypairSlice = createSlice({
  name: 'keypair',
  initialState,
  reducers: {
    setKeypair(state, action) {
      const { publicKey, secretKey } = action.payload;
      state.publicKey = publicKey;
      state.secretKey = secretKey;
    },
  },
  extraReducers: {
    [RESET_STORE]: (state, action) => {
      return initialState;
    },
  },
});

// Export channel actions
export const { setKeypair } = keypairSlice.actions;

// Export reducer
export default keypairSlice.reducer;
