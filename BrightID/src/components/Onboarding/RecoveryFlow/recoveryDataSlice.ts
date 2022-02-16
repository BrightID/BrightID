import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { original } from 'immer';
import { uInt8ArrayToB64 } from '@/utils/encoding';
import { RecoveryErrorType } from '@/components/Onboarding/RecoveryFlow/RecoveryError';
import { CHANNEL_TTL } from '@/utils/constants';
import { RESET_STORE } from '@/actions';

export const initialState: RecoveryData = {
  publicKey: '',
  secretKey: new Uint8Array(),
  aesKey: '',
  errorMessage: '',
  errorType: RecoveryErrorType.NONE,
  id: '',
  name: '',
  photo: '',
  timestamp: 0,
  sigs: {},
  uploadCompletedBy: {},
  qrcode: '',
  recoveredConnections: 0,
  recoveredGroups: 0,
  recoveredBlindSigs: 0,
  channel: {
    channelId: '',
    url: null,
    expires: 0,
  },
};

const recoveryData = createSlice({
  name: 'recoveryData',
  initialState,
  reducers: {
    init(
      state,
      action: PayloadAction<{
        publicKey?: Uint8Array;
        secretKey?: Uint8Array;
        aesKey: string;
      }>,
    ) {
      const { publicKey, secretKey, aesKey } = action.payload;
      state.publicKey = uInt8ArrayToB64(publicKey ?? new Uint8Array());
      state.secretKey = secretKey;
      state.aesKey = aesKey;
      state.timestamp = Date.now();
      state.errorMessage = '';
      state.errorType = RecoveryErrorType.NONE;
      state.id = '';
      state.name = '';
      state.photo = '';
      state.recoveredConnections = 0;
      state.recoveredGroups = 0;
      state.recoveredBlindSigs = 0;
      state.sigs = {};
      state.uploadCompletedBy = {};
    },
    setRecoveryAesKey(state, action: PayloadAction<string>) {
      state.aesKey = action.payload;
    },
    setRecoveryChannel(
      state,
      action: PayloadAction<{ channelId: string; url: URL }>,
    ) {
      const { channelId, url } = action.payload;
      state.channel.channelId = channelId;
      state.channel.url = url;
      state.channel.expires = Date.now() + CHANNEL_TTL;
    },
    resetChannelExpiration(state) {
      state.channel.expires = Date.now() + CHANNEL_TTL;
    },
    setSig(state, action: PayloadAction<{ sig: Signature; signer: string }>) {
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
    updateNamePhoto(
      state,
      action: PayloadAction<{ name: string; photo: string }>,
    ) {
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
    increaseRecoveredBlindSigs(state, action: PayloadAction<number>) {
      state.recoveredBlindSigs += action.payload;
    },
    // used for import/sync
    setUploadCompletedBy(state, action: PayloadAction<string>) {
      state.uploadCompletedBy[action.payload] = true;
    },
    // used for import
    setRecoveryId(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialState;
    },
  },
});

export const uploadCompletedByOtherSide = (state) => {
  return Object.keys(state.recoveryData.uploadCompletedBy).length > 0;
};

// Export channel actions
export const {
  init,
  increaseRecoveredConnections,
  increaseRecoveredGroups,
  increaseRecoveredBlindSigs,
  setRecoveryAesKey,
  setRecoveryChannel,
  setSig,
  updateNamePhoto,
  resetChannelExpiration,
  resetRecoverySigs,
  resetRecoveryData,
  setRecoveryError,
  setUploadCompletedBy,
  setRecoveryId,
} = recoveryData.actions;

// Export reducer
export default recoveryData.reducer;
