import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';

import {
  SocialMediaType,
  socialMediaVariations,
} from '@/components/EditProfile/socialMediaVariations';

const socialMediaVariationAdapter = createEntityAdapter<SocialMediaVariation>();
const emptyInitialState = socialMediaVariationAdapter.getInitialState();
const initialState = socialMediaVariationAdapter.upsertMany(
  emptyInitialState,
  socialMediaVariations,
);

const socialMediaVariationSlice = createSlice({
  name: 'socialMediaVariation',
  initialState,
  reducers: {
    upsertSocialMediaVariations: socialMediaVariationAdapter.upsertMany,
  },
});

export const { upsertSocialMediaVariations } =
  socialMediaVariationSlice.actions;

export const {
  selectById: selectSocialMediaVariationById,
  selectAll: selectAllSocialMediaVariations,
} = socialMediaVariationAdapter.getSelectors(
  (state: State) => state.socialMediaVariations,
);

export const selectAllSocialMediaVariationsByType = () =>
  createSelector(
    selectAllSocialMediaVariations,
    (_: State, type: SocialMediaType) => type,
    (socialMediaVariations, type) =>
      socialMediaVariations.filter((item) => item.type === type),
  );

export default socialMediaVariationSlice.reducer;
