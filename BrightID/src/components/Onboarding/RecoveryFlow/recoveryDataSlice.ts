import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { original } from 'immer';
import { RESET_STORE } from '@brightid/redux/actions';
import { uInt8ArrayToB64 } from '@/utils/encoding';
import { RecoveryErrorType } from '@/components/Onboarding/RecoveryFlow/RecoveryError';
import { recover_steps, RECOVERY_CHANNEL_TTL } from '@/utils/constants';
import { pollRecoveryChannel } from '@/components/Onboarding/RecoveryFlow/thunks/channelThunks';

export const initialState: RecoveryData = {
  recoverStep: recover_steps.NOT_STARTED,
  publicKey: '',
  secretKey: new Uint8Array(),
  aesKey: '',
  errorMessage: '',
  errorType: RecoveryErrorType.NONE,
  id: '',
  name: '',
  photo: {
    filename: '',
  },
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
    pollTimerId: null,
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
      state.photo = {
        filename: '',
      };
      state.recoveredConnections = 0;
      state.recoveredGroups = 0;
      state.recoveredBlindSigs = 0;
      state.sigs = {};
      state.uploadCompletedBy = {};
      state.recoverStep = recover_steps.NOT_STARTED;
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
      state.channel.expires = Date.now() + RECOVERY_CHANNEL_TTL;
    },
    resetChannelExpiration(state) {
      state.channel.expires = Date.now() + RECOVERY_CHANNEL_TTL;
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
        state.photo = {
          filename: '',
        };
      } else {
        state.sigs[signer] = sig;
      }
    },
    updateNamePhoto(
      state,
      action: PayloadAction<{ name: string; photo: Photo }>,
    ) {
      const { name, photo } = action.payload;
      state.name = name;
      state.photo = photo;
    },
    resetRecoverySigs(state) {
      state.sigs = {};
    },
    resetRecoveryData() {
      return { ...initialState };
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
    setRecoverStep(state, action: PayloadAction<RecoverStep_Type>) {
      state.recoverStep = action.payload;
    },
    setChannelIntervalId(state, action: PayloadAction<IntervalId>) {
      state.channel.pollTimerId = action.payload;
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialState;
    },
  },
});

export const uploadCompletedByOtherSide = (state: RootState) => {
  return Object.keys(state.recoveryData.uploadCompletedBy).length > 0;
};

export const selectRecoveryChannel = (state: RootState) =>
  state.recoveryData.channel;

export const selectRecoveryData = (state: RootState) => state.recoveryData;

export const selectRecoveryStep = (state) => state.recoveryData.recoverStep;

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
  setRecoverStep,
  setChannelIntervalId,
} = recoveryData.actions;

export const rejoinRecoveryChannel =
  (): AppThunk => (dispatch: AppDispatch, getState) => {
    const channel = selectRecoveryChannel(getState());
    if (channel?.channelId) {
      console.log(`Rejoining recovery channel ${channel.channelId}`);
      dispatch(pollRecoveryChannel());
    }
  };

// Export reducer
export default recoveryData.reducer;
