import { find, propEq } from 'ramda';
import { Draft, original } from 'immer';
import { PayloadAction } from '@reduxjs/toolkit';
import socialMediaService, { socialMediaUrl } from '@/api/socialMediaService';
import { BrightIdNetwork, linkAppId } from '@/components/Apps/model';
import store from '@/store';
import { selectAllApps } from '@/reducer/appsSlice';
import {
  saveSocialMedia,
  selectSocialMediaById,
} from '@/reducer/socialMediaSlice';
import {
  selectSocialMediaVariationById,
  upsertSocialMediaVariations,
} from '@/reducer/socialMediaVariationSlice';

export const saveAndLinkSocialMedia =
  (incomingSocialMedia: SocialMedia) =>
  async (dispatch: dispatch, getState: getState) => {
    const prevProfile = selectSocialMediaById(
      getState(),
      incomingSocialMedia.id,
    );

    // First, update locally, so the user doesn't need to wait for
    // the server to complete the request to see his new profile in the UI.
    dispatch(saveSocialMedia(incomingSocialMedia));

    const socialMediaVariation = selectSocialMediaVariationById(
      getState(),
      incomingSocialMedia.id,
    );
    const brightIdSocialAppData: BrightIdSocialAppData = {
      synced: false,
      linked: false,
      contextId: null,
      token: null,
      ...prevProfile?.brightIdSocialAppData,
    };
    let { synced, token, contextId, linked } = brightIdSocialAppData;

    if (!token) {
      try {
        const data = await socialMediaService.createSocialMedia({
          profile: incomingSocialMedia.profile,
          variation: socialMediaVariation.id,
          network: __DEV__ ? BrightIdNetwork.TEST : BrightIdNetwork.NODE,
        });
        token = data.token;
        contextId = data.contextId;
        synced = true;
      } catch (e) {
        console.log(e);
      }
    } else if (
      prevProfile?.profile !== incomingSocialMedia.profile ||
      !synced
    ) {
      synced = false;
      try {
        await socialMediaService.updateSocialMedia({
          token,
          profile: incomingSocialMedia.profile,
        });
        synced = true;
      } catch (e) {
        console.log(e);
      }
    }
    if (contextId && !linked) {
      const appId = socialMediaVariation.brightIdAppName;
      if (appId) {
        const apps = selectAllApps(store.getState());
        const appInfo = find(propEq('id', appId))(apps) as AppInfo;
        if (appInfo && appInfo.usingBlindSig) {
          try {
            linked = await linkAppId(
              appId,
              contextId,
              `${socialMediaUrl}/v1/social-media/check-verification/`,
              true,
            );
          } catch (e) {
            console.log(e);
          }
        }
      }
    }

    const socialMedia: SocialMedia = {
      ...incomingSocialMedia,
      brightIdSocialAppData: { synced, token, contextId, linked },
    };
    dispatch(saveSocialMedia(socialMedia));
    return socialMedia;
  };

export const removeSocialMedia =
  (id: string) => async (dispatch: dispatch, getState: getState) => {
    const prevProfile = selectSocialMediaById(getState(), id);
    socialMediaService
      .deleteSocialMediaProfile(prevProfile.brightIdSocialAppData.token)
      .catch((e) => console.log(e));
    const socialMedia: SocialMedia = {
      ...prevProfile,
      profile: null,
    };
    dispatch(saveSocialMedia(socialMedia));
  };

export const updateSocialMediaVariations =
  () => async (dispatch: dispatch, getState: getState) => {
    const socialMediaVariations =
      await socialMediaService.retrieveSocialMediaVariations();
    dispatch(upsertSocialMediaVariations(socialMediaVariations));
  };
