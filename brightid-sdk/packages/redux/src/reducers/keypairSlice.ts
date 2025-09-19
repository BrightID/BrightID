import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RESET_STORE } from "../actions/resetStore.js";

const initialState: KeypairState = {
  publicKey: "",
  secretKey: new Uint8Array(),
};

export const keypairSlice = createSlice({
  name: "keypair",
  initialState,
  reducers: {
    setKeypair(state, action: PayloadAction<KeypairState>) {
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

export const keypairReducer = keypairSlice.reducer;
