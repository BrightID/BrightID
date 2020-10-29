// @flow

import {
  createSelector,
  createSlice,
  createEntityAdapter,
} from '@reduxjs/toolkit';

import { original } from 'immer';

const socialMediaAdapter = createEntityAdapter({
  // Keep the "all IDs" array sorted based on book titles
  sortComparer: (a, b) => a.order < b.order,
});

const socialMediaSlice = createSlice({
  name: 'socialMedia',
  initialState: socialMediaAdapter.getInitialState(),
  reducers: {
    // Can pass adapter functions directly as case reducers.  Because we're passing this
    // as a value, `createSlice` will auto-generate the `bookAdded` action type / creator
    addSocialMedia: (state, action) => {
      const { entities, ids } = original(state);
      // check to see if order needs to be modified
      if (entities[action.payload.id]?.order !== action.payload.order) {
        // if order needs to change, or entity does not exist, update the order for the rest of the list

        let prevOrder = entities[action.payload.id]?.order;

        const updateList = ids.map((id) => {
          let order = entities[id]?.order;
          if (id === action.payload.id) {
            order = action.payload.order;
          } else if (order < prevOrder) {
            order += 1;
          }
          return {
            id,
            changes: { order },
          };
        });
        socialMediaAdapter.updateMany(state, updateList);
      }

      if (!ids.includes(action.payload.id)) {
        socialMediaAdapter.addOne(state, action);
      }
    },
    updateUrl: (state, action) => {
      socialMediaAdapter.updateOne({
        id: action.payload.id,
        changes: {
          url: action.payload.url,
        },
      });
    },
    removeSocialMedia: socialMediaAdapter.removeOne,
  },
});

export const {
  addSocialMedia,
  updateUrl,
  updateOrder,
  removeSocialMedia,
} = socialMediaSlice.actions;

export const {
  selectById: selectChannelById,
  selectAll: selectAllChannels,
} = socialMediaAdapter.getSelectors((state) => state.socialMedia);

export default socialMediaSlice.reducer;
