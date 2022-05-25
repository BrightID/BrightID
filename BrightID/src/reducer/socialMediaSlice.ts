import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';

import { original, Draft } from 'immer';

const socialMediaAdapter = createEntityAdapter<SocialMedia>({
  sortComparer: (a, b) => a.order - b.order,
});

const socialMediaSlice = createSlice({
  name: 'socialMedia',
  initialState: socialMediaAdapter.getInitialState(),
  reducers: {
    saveSocialMedia: (
      state: Draft<SocialMediaState>,
      action: PayloadAction<SocialMedia>,
    ) => {
      // incoming payload values
      const {
        id: incomingId,
        order: incomingOrder,
        profile: incomingProfile,
        brightIdSocialAppData: incomingBrightIdSocialAppData,
      } = action.payload;

      // access previous values from the reducer
      const { entities, ids } = original(state);

      const prevEntity = entities[incomingId];

      // if social media does not already exist, add it to the list,
      if (!prevEntity) {
        socialMediaAdapter.addOne(state, action);
        // if order already exists in list, then the user wants to replace the social media
        if (incomingOrder < ids.length) {
          const entityToRemove = Object.values(entities).find(
            (entity) => entity.order === incomingOrder,
          );

          socialMediaAdapter.removeOne(state, entityToRemove.id);
        }
      }

      // the user is only updating their social media profile
      if (prevEntity && prevEntity.order === incomingOrder) {
        socialMediaAdapter.updateOne(state, {
          id: incomingId,
          changes: {
            profile: incomingProfile,
            brightIdSocialAppData: incomingBrightIdSocialAppData,
          },
        });
      }

      // this indicates the user wants to re-order the list
      if (prevEntity && prevEntity.order !== incomingOrder) {
        // only update the order for
        // 1. incoming id
        // 2. Entities between previous order and incoming order

        const shouldIncrement = prevEntity.order > incomingOrder;
        const shouldDecrement = !shouldIncrement;

        const updateList = Object.values(entities).map((entity) => {
          let { order, profile, brightIdSocialAppData } = entity;
          if (entity.id === incomingId) {
            order = incomingOrder;
            profile = incomingProfile;
            brightIdSocialAppData = incomingBrightIdSocialAppData;
          } else if (
            shouldIncrement &&
            order >= incomingOrder &&
            order <= prevEntity.order
          ) {
            order += 1;
          } else if (
            shouldDecrement &&
            order <= incomingOrder &&
            order >= prevEntity.order
          ) {
            order -= 1;
          }

          return {
            id: entity.id,
            changes: { order, profile, brightIdSocialAppData },
          };
        });

        socialMediaAdapter.updateMany(state, updateList);
      }
    },
    setProfileDisplayWidth: (
      state: Draft<SocialMediaState>,
      action: PayloadAction<{ id: string; width: number | string }>,
    ) => {
      socialMediaAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          profileDisplayWidth: action.payload.width,
        },
      });
    },
  },
});

export const { saveSocialMedia, setProfileDisplayWidth } =
  socialMediaSlice.actions;

export const {
  selectById: selectSocialMediaById,
  selectAll: selectAllSocialMedia,
} = socialMediaAdapter.getSelectors((state: State) => state.socialMedia);

export const selectExistingSocialMedia = createSelector(
  selectAllSocialMedia,
  (socialMedias) => socialMedias.filter((socialMedia) => socialMedia.profile),
);

export const selectExistingSocialMediaIds = createSelector(
  selectExistingSocialMedia,
  (socialMedias) => socialMedias.map((socialMedia) => socialMedia.id),
);

export const selectAllSocialMediaToShare = createSelector(
  selectExistingSocialMedia,
  (socialMedias) =>
    socialMedias.map((socialMedia) => ({
      id: socialMedia.id,
      company: socialMedia.company,
      order: socialMedia.order,
      profile: socialMedia.profile,
      profileDisplayWidth: socialMedia.profileDisplayWidth,
    })) as SocialMediaShared[],
);
export default socialMediaSlice.reducer;
