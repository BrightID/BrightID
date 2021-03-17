import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { original } from 'immer';
import { uInt8ArrayToB64 } from '@/utils/encoding';
import { RecoveryErrorType } from '@/components/Onboarding/RecoveryFlow/RecoveryError';

const FIFTEEN_MINUTES = 900000;

export const initialState: RecoveryData = {
  publicKey: '',
  secretKey: '',
  aesKey: '',
  errorMessage: '',
  errorType: RecoveryErrorType.NONE,
  id: '',
  name: '',
  photo: '',
  timestamp: 0,
  sigs: {},
  qrcode: '',
  recoveredConnections: 0,
  recoveredGroups: 0,
  channel: {
    channelId: '',
    url: null,
    expires: 0,
  },
};

interface ErrorPayload {
  errorType: RecoveryErrorType;
  errorMessage?: string;
}

const recoveryData = createSlice({
  name: 'recoveryData',
  initialState,
  reducers: {
    init(state, action) {
      const { publicKey, secretKey, aesKey } = action.payload;
      state.publicKey = uInt8ArrayToB64(publicKey);
      state.secretKey = secretKey;
      state.aesKey = aesKey;
      state.errorMessage = '';
      state.errorType = RecoveryErrorType.NONE;
      state.id = '';
      state.name = '';
      state.photo = '';
      state.recoveredConnections = 0;
      state.recoveredGroups = 0;
      state.timestamp = Date.now();
      state.sigs = {};
      state.qrcode = encodeURIComponent(`Recovery2_${aesKey}`);
    },
    setChannel(state, action) {
      const { channelId, url } = action.payload;
      state.channel.channelId = channelId;
      state.channel.url = url;
      state.channel.expires = Date.now() + FIFTEEN_MINUTES;
    },
    setSig(state, action) {
      const { signer, sig } = action.payload;
      // access previous values from the reducer
      const { id } = original(state);

      if (sig.id !== id) {
        state.sigs = { [signer]: sig };
        state.id = sig.id;
        // clear name and photo in case id changes
        state.name = '';
        state.photo = '';
      } else {
        state.sigs[signer] = sig;
      }
    },
    updateNamePhoto(state, action) {
      const { name, photo } = action.payload;
      state.name = name;
      state.photo = photo;
    },
    resetRecoverySigs(state) {
      state.sigs = {};
    },
    resetRecoveryData() {
      return initialState;
    },
    setRecoveryError(
      state,
      {
        payload,
      }: PayloadAction<{
        errorType: RecoveryErrorType;
        errorMessage?: string;
      }>,
    ) {
      state.errorType = payload.errorType;
      state.errorMessage = payload.errorMessage;
    },
    increaseRecoveredConnections(state, action: PayloadAction<number>) {
      state.recoveredConnections += action.payload;
    },
    increaseRecoveredGroups(state, action: PayloadAction<number>) {
      state.recoveredGroups += action.payload;
    },
  },
});

// Export channel actions
export const {
  init,
  increaseRecoveredConnections,
  increaseRecoveredGroups,
  setChannel,
  setSig,
  updateNamePhoto,
  resetRecoverySigs,
  resetRecoveryData,
  setRecoveryError,
} = recoveryData.actions;

// Export reducer
export default recoveryData.reducer;
