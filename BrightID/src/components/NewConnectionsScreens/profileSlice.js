import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

const profileAdapter = createEntityAdapter();

/*
  Profile slice contains all profiles in decrypted state
 */

// By default, `createEntityAdapter` gives you `{ ids: [], entities: {} }`.
// If you want to track 'loading' or other keys, you would initialize them here:
// `getInitialState({ loading: false, activeRequestId: null })`
const initialState = profileAdapter.getInitialState();

const profileSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    addProfile: profileAdapter.addOne,
    removeProfile: profileAdapter.removeOne,
  },
});

export const { addProfile, removeProfile } = profileSlice.actions;

export default profileSlice.reducer;
