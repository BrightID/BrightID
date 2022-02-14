import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { socialMediaVariationList } from '@/components/EditProfile/socialMediaVariationList';

const socialMediaVariationAdapter = createEntityAdapter<SocialMediaVariation>();
const emptyInitialState = socialMediaVariationAdapter.getInitialState();
const initialState = socialMediaVariationAdapter.upsertMany(
  emptyInitialState,
  socialMediaVariationList,
);

const socialMediaVariationSlice = createSlice({
  name: 'socialMediaVariation',
  initialState,
  reducers: {},
});

export const {
  selectById: selectSocialMediaVariationById,
  selectAll: selectAllSocialMediaVariations,
} = socialMediaVariationAdapter.getSelectors(
  (state: State) => state.socialMediaVariations,
);

export default socialMediaVariationSlice.reducer;
