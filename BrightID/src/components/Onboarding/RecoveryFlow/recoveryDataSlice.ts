import { createSlice } from '@reduxjs/toolkit';
import { original } from 'immer';
import { uInt8ArrayToB64 } from '@/utils/encoding';
import { CHANNEL_TTL } from '@/utils/constants';

export const initialState: RecoveryData = {
  publicKey: '',
  secretKey: '',
  aesKey: '',
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

const recoveryData = createSlice({
  name: 'recoveryData',
  initialState,
  reducers: {
    init(state, action) {
      const { publicKey, secretKey, aesKey } = action.payload;
      state.publicKey = uInt8ArrayToB64(publicKey);
      state.secretKey = secretKey;
      state.aesKey = aesKey;
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
      state.channel.expires = Date.now() + CHANNEL_TTL;
    },
    resetChannelExpiration(state) {
      state.channel.expires = Date.now() + CHANNEL_TTL;
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
    increaseRecoveredConnections(state, action) {
      const { count } = action.payload;
      state.recoveredConnections += count;
    },
    increaseRecoveredGroups(state, action) {
      const { count } = action.payload;
      state.recoveredGroups += count;
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
  resetChannelExpiration,
  resetRecoverySigs,
  resetRecoveryData,
} = recoveryData.actions;

// Export reducer
export default recoveryData.reducer;
