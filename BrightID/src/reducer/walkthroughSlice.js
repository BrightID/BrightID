// @flow

import { createSlice } from '@reduxjs/toolkit';

const initialState: WalkthroughState = {
  editProfileLayout: null,
  headerHeight: 0,
};

const walkthroughSlice = createSlice({
  name: 'walkthrough',
  initialState,
  reducers: {
    setEditProfileLayout(state, action) {
      state.editProfileLayout = action.payload;
    },
    setHeaderHeight(state, action) {
      state.headerHeight = action.payload;
    },
  },
});

// Export channel actions
export const {
  setEditProfileLayout,
  setHeaderHeight,
} = walkthroughSlice.actions;

// Export reducer
export default walkthroughSlice.reducer;
