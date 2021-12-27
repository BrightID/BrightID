import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

const initialState: UserState = {
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
    setVerifications(state, action: PayloadAction<Array<Verification>>) {
      state.verifications = action.payload;
    },
    hydrateUser(state, action) {
      const { name, photo, backupCompleted, firstRecoveryTime, id, password } =
        action.payload;

      state.backupCompleted = backupCompleted;
      state.name = name;
      state.photo = photo;
      state.id = id;
      state.password = password;
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialState;
    },
  },
});

// Export channel actions
export const {
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
