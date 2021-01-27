// @flow

import { createSlice } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

const initialState: UserState = {
  score: 0,
  isSponsored: false,
  name: '',
  photo: { filename: '' },
  searchParam: '',
  backupCompleted: false,
  id: '',
  password: '',
  verifications: [],
  secretKey: '',
  eula: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserScore(state, action) {
      state.score = action.payload;
    },
    setIsSponsored(state, action) {
      state.isSponsored = action.payload;
    },
    setPhoto(state, action) {
      state.photo = action.payload;
    },
    setSearchParam(state, action) {
      state.searchParam = action.payload;
    },
    setEula(state, action) {
      state.eula = action.payload;
    },
    setUserData(state, action) {
      const { id, name, photo, secretKey } = action.payload;
      state.photo = photo;
      state.name = name;
      state.id = id;
      state.secretKey = secretKey;
    },
    setName(state, action) {
      state.name = action.payload;
    },
    setBackupCompleted(state, action) {
      state.backupCompleted = action.payload;
    },
    setPassword(state, action) {
      state.password = action.payload;
    },
    setUserId(state, action) {
      state.id = action.payload;
    },
    setVerifications(state, action) {
      state.verifications = action.payload;
    },
    hydrateUser(state, action) {
      const {
        score,
        name,
        photo,
        backupCompleted,
        id,
        password,
      } = action.payload;

      state.backupCompleted = backupCompleted;
      state.score = score;
      state.name = name;
      state.photo = photo;
      state.id = id;
      state.password = password;
    },
  },
  extraReducers: {
    [RESET_STORE]: (state, action) => {
      return initialState;
    },
  },
});

// Export channel actions
export const {
  setUserScore,
  setIsSponsored,
  setPhoto,
  setSearchParam,
  setUserData,
  setName,
  setBackupCompleted,
  setPassword,
  setUserId,
  setVerifications,
  setEula,
  hydrateUser,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;
