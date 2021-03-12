import { createSlice } from '@reduxjs/toolkit';

const initialState: WalkthroughState = {
  editProfileMenuLayout: { x: null, y: null, width: null, height: null },
  editProfileTextLayout: { x: null, y: null, width: null, height: null },
  headerHeight: 0,
};

const walkthroughSlice = createSlice({
  name: 'walkthrough',
  initialState,
  reducers: {
    setEditProfileMenuLayout(state, action) {
      state.editProfileMenuLayout = action.payload;
    },
    setEditProfileTextLayout(state, action) {
      state.editProfileTextLayout = action.payload;
    },
    setHeaderHeight(state, action) {
      state.headerHeight = action.payload;
    },
  },
});

// Export channel actions
export const {
  setEditProfileMenuLayout,
  setEditProfileTextLayout,
  setHeaderHeight,
} = walkthroughSlice.actions;

// Export reducer
export default walkthroughSlice.reducer;
