import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

const initialState: Keypair = {
  publicKey: '',
  secretKey: new Uint8Array(),
};

const keypairSlice = createSlice({
  name: 'keypair',
  initialState,
  reducers: {
    setKeypair(state, action: PayloadAction<Keypair>) {
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

// Export selectors
export const selectKeypair = (state: RootState) => ({
  publicKey: state.keypair.publicKey,
  secretKey: state.keypair.secretKey,
});

// Export reducer
export default keypairSlice.reducer;
