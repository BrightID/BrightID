// @flow

import {
  createSelector,
  createSlice,
  createEntityAdapter,
} from '@reduxjs/toolkit';

import { original } from 'immer';

// helpers

// returns true if incoming order is changed, or if

const socialMediaAdapter = createEntityAdapter({
  // Keep the "all IDs" array sorted based on book titles
  sortComparer: (a, b) => a.order - b.order,
});

const socialMediaSlice = createSlice({
  name: 'socialMedia',
  initialState: socialMediaAdapter.getInitialState(),
  reducers: {
    // Can pass adapter functions directly as case reducers.  Because we're passing this
    // as a value, `createSlice` will auto-generate the `bookAdded` action type / creator
    addSocialMedia: (state, action) => {
      // incoming payload values
      const { id: incomingId, order: incomingOrder } = action.payload;

      // access previous values from the reducer
      let { entities, ids } = original(state);

      const prevEntity = entities[incomingId];

      if (!prevEntity) {
        console.log(`adding ${action.payload.name} to social media`);
        socialMediaAdapter.addOne(state, action);
        // remove entity if order is already exists
        // this indicates user wants to replace the social media selected
        if (incomingOrder < ids.length) {
          const entityToRemove = Object.values(entities).find(
            (entity) => entity.order === incomingOrder,
          );
          console.log(`removing ${entityToRemove.name} from social media`);
          socialMediaAdapter.removeOne(state, entityToRemove.id);
        }
      }

      // re-order entire list if only the incoming order is being changed3
      // this indicates the user wants to re-order the list
      if (prevEntity && prevEntity.order !== incomingOrder) {
        console.log(
          `changing order of ${prevEntity.name} from ${prevEntity.order} to ${incomingOrder}`,
        );
        // create list of updates for updateMany
        const shouldIncrement = prevEntity.order > incomingOrder;
        const shouldDecrement = !shouldIncrement;

        if (shouldIncrement) {
          console.log('should increment');
        } else {
          console.log('should decrement');
        }

        const updateList = Object.values(entities).map((entity) => {
          // only update the order for
          // 1. incoming id
          // 2. entities between previous order and incoming order
          let { order } = entity;
          if (entity.id === incomingId) {
            order = incomingOrder;
          } else if (
            shouldIncrement &&
            order >= incomingOrder &&
            order <= prevEntity.order
          ) {
            console.log(
              `bumping order of ${entity.name} from ${order} to ${order + 1}`,
            );
            order += 1;
          } else if (
            shouldDecrement &&
            order <= incomingOrder &&
            order >= prevEntity.order
          ) {
            console.log(
              `decrementing order of ${entity.name} from ${order} to ${
                order - 1
              }`,
            );
            order -= 1;
          } else {
            console.log(
              `not changing order of ${entity.name} - ${entity.order}`,
            );
          }

          return {
            id: entity.id,
            changes: { order },
          };
        });

        socialMediaAdapter.updateMany(state, updateList);
      }
    },
    updateUrl: (state, action) => {
      const { id, url } = action.payload;

      socialMediaAdapter.updateOne({
        id,
        changes: {
          url,
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
  selectById: selectSocialMediaById,
  selectAll: selectAllSocialMedia,
} = socialMediaAdapter.getSelectors((state) => state.socialMedia);

export default socialMediaSlice.reducer;
