import { createSlice } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

const initialState: Keypair = {
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
    [RESET_STORE]: () => {
      return initialState;
    },
  },
});

// Export channel actions
export const { setKeypair } = keypairSlice.actions;

// Export reducer
export default keypairSlice.reducer;
