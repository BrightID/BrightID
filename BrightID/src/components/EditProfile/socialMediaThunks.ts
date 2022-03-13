import { find, propEq } from 'ramda';
import socialMediaService, {
  SOCIAL_API_AUTHENTICATION_ERROR,
  socialMediaUrl,
} from '@/api/socialMediaService';
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

async function linkSocialMediaApp(appId: string, contextId: string) {
  let linked = false;
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
  return linked;
}

async function syncSocialMedia(
  token: string,
  profile: string,
  socialMediaVariationId: string,
  contextId: string,
) {
  let synced = false;
  if (token) {
    try {
      await socialMediaService.updateSocialMedia({
        token,
        profile,
      });
      synced = true;
    } catch (e) {
      if (e.message === SOCIAL_API_AUTHENTICATION_ERROR) {
        return syncSocialMedia(null, profile, socialMediaVariationId, null);
      }
      console.log(e);
    }
  } else {
    try {
      const data = await socialMediaService.createSocialMedia({
        profile,
        variation: socialMediaVariationId,
        network: __DEV__ ? BrightIdNetwork.TEST : BrightIdNetwork.NODE,
      });
      token = data.token;
      contextId = data.contextId;
      synced = true;
    } catch (e) {
      console.log(e);
    }
  }
  return { token, contextId, synced };
}

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

    if (!synced || prevProfile?.profile !== incomingSocialMedia.profile) {
      const __ret = await syncSocialMedia(
        token,
        incomingSocialMedia.profile,
        socialMediaVariation.id,
        contextId,
      );
      token = __ret.token;
      contextId = __ret.contextId;
      synced = __ret.synced;
    }

    if (synced && !linked) {
      const appId = socialMediaVariation.brightIdAppName;
      if (appId) {
        linked = await linkSocialMediaApp(appId, contextId);
      }
    }

    const socialMedia: SocialMedia = {
      ...incomingSocialMedia,
      brightIdSocialAppData: { synced, token, contextId, linked },
    };
    dispatch(saveSocialMedia(socialMedia));
    return socialMedia;
  };

export const removeSocialMediaThunk =
  (id: string) => async (dispatch: dispatch, getState: getState) => {
    const prevProfile = selectSocialMediaById(getState(), id);
    if (prevProfile) {
      if (prevProfile.brightIdSocialAppData?.token) {
        try {
          await socialMediaService.deleteSocialMediaProfile(
            prevProfile.brightIdSocialAppData.token,
          );
        } catch (e) {
          // if the token by some reason doesn't exist on the server, so
          // there is nothing to delete, so ignore the error.
          if (e.message !== SOCIAL_API_AUTHENTICATION_ERROR) {
            throw e;
          }
        }
      }
      const socialMedia: SocialMedia = {
        ...prevProfile,
        profile: null,
      };
      dispatch(saveSocialMedia(socialMedia));
    }
  };

export const updateSocialMediaVariations =
  () => async (dispatch: dispatch, getState: getState) => {
    const socialMediaVariations =
      await socialMediaService.retrieveSocialMediaVariations();
    dispatch(upsertSocialMediaVariations(socialMediaVariations));
  };
