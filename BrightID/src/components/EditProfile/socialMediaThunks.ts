import { find, propEq } from 'ramda';
import socialMediaService, {
  SOCIAL_API_AUTHENTICATION_ERROR,
  socialMediaUrl,
} from '@/api/socialMediaService';
import { getSignedTimestamp, linkAppId } from '@/components/Apps/model';
import store, { useSelector } from '@/store';
import { selectAllApps } from '@/reducer/appsSlice';
import {
  saveSocialMedia,
  selectAllSocialMedia,
  selectSocialMediaById,
} from '@/reducer/socialMediaSlice';
import {
  selectSocialMediaVariationById,
  upsertSocialMediaVariations,
} from '@/reducer/socialMediaVariationSlice';
import { generateSocialProfileHashes } from '@/utils/socialUtils';
import { SOCIAL_MEDIA_SIG_WAIT_TIME } from '@/utils/constants';
import {
  selectSyncSocialMediaEnabled,
  setSyncSocialMediaEnabled,
} from '@/reducer/settingsSlice';
import { BrightIdNetwork } from '@/components/Apps/types.d';

export async function linkSocialMediaApp(appId: string, appUserId: string) {
  let linked = false;
  const apps = selectAllApps(store.getState());
  const appInfo = find(propEq('id', appId))(apps) as AppInfo;
  if (appInfo && appInfo.usingBlindSig) {
    const signedTimestamp = getSignedTimestamp(appInfo);
    if (
      signedTimestamp &&
      Date.now() - signedTimestamp > SOCIAL_MEDIA_SIG_WAIT_TIME
    ) {
      try {
        linked = await linkAppId(appId, appUserId, true);
      } catch (e) {
        console.log(e);
      }
    }
  }
  return linked;
}

export async function syncSocialMedia(
  token: string,
  incomingSocialMedia: SocialMedia,
  socialMediaVariation: SocialMediaVariation,
) {
  let synced = false;
  let appUserId = incomingSocialMedia.brightIdSocialAppData?.appUserId || null;
  const profileHashes = generateSocialProfileHashes(
    incomingSocialMedia.profile,
    socialMediaVariation.id,
  );
  if (token) {
    try {
      await socialMediaService.updateSocialMedia({
        token,
        profileHashes,
      });
      synced = true;
    } catch (e) {
      if (e.message === SOCIAL_API_AUTHENTICATION_ERROR) {
        return syncSocialMedia(null, incomingSocialMedia, socialMediaVariation);
      }
      console.log(e);
    }
  } else {
    try {
      const data = await socialMediaService.createSocialMedia({
        profileHashes,
        variation: socialMediaVariation.id,
        network: __DEV__ ? BrightIdNetwork.TEST : BrightIdNetwork.NODE,
      });
      token = data.token;
      appUserId = data.appUserId;
      synced = true;
    } catch (e) {
      console.log(e);
    }
  }
  return { token, appUserId, synced };
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
    const syncSocialMediaEnabled = selectSyncSocialMediaEnabled(getState());
    if (!syncSocialMediaEnabled) {
      return incomingSocialMedia;
    }
    const socialMediaVariation = selectSocialMediaVariationById(
      getState(),
      incomingSocialMedia.id,
    );
    const brightIdSocialAppData: BrightIdSocialAppData = {
      synced: false,
      linked: false,
      appUserId: null,
      token: null,
      ...incomingSocialMedia.brightIdSocialAppData,
    };
    let { synced, token, appUserId, linked } = brightIdSocialAppData;

    if (!synced || prevProfile?.profile !== incomingSocialMedia.profile) {
      const __ret = await syncSocialMedia(
        token,
        incomingSocialMedia,
        socialMediaVariation,
      );
      token = __ret.token;
      appUserId = __ret.appUserId;
      synced = __ret.synced;
    }

    if (synced && !linked) {
      const appId = socialMediaVariation.brightIdAppId;
      if (appId) {
        linked = await linkSocialMediaApp(appId, appUserId);
      }
    }

    const socialMedia: SocialMedia = {
      ...incomingSocialMedia,
      brightIdSocialAppData: { synced, token, appUserId, linked },
    };
    dispatch(saveSocialMedia(socialMedia));
    return socialMedia;
  };

export const removeSocialFromServer = async (socialMedia: SocialMedia) => {
  if (socialMedia.brightIdSocialAppData?.token) {
    try {
      await socialMediaService.deleteSocialMediaProfile(
        socialMedia.brightIdSocialAppData.token,
      );
    } catch (e) {
      // if the token by some reason doesn't exist on the server, so
      // there is nothing to delete, so ignore the error.
      if (e.message !== SOCIAL_API_AUTHENTICATION_ERROR) {
        throw e;
      }
    }
  }
};

export const removeSocialMediaThunk =
  (id: string) => async (dispatch: dispatch, getState: getState) => {
    const prevProfile = selectSocialMediaById(getState(), id);
    if (prevProfile) {
      await removeSocialFromServer(prevProfile);
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

export const syncAndLinkSocialMedias =
  () => async (dispatch: dispatch, getState: getState) => {
    const socialMedias = selectAllSocialMedia(getState());
    socialMedias.forEach((socialMedia) => {
      if (socialMedia.profile) {
        dispatch(saveAndLinkSocialMedia(socialMedia));
      }
    });
  };

export const removeAllSocialMedias =
  () => async (dispatch: dispatch, getState: getState) => {
    const socialMedias = selectAllSocialMedia(getState());
    for (let i = 0; i < socialMedias.length; i++) {
      const socialMedia = socialMedias[i];
      if (socialMedia.profile) {
        await removeSocialFromServer(socialMedia);
        const newSocialMedia: SocialMedia = {
          ...socialMedia,
          brightIdSocialAppData: {
            ...socialMedia.brightIdSocialAppData,
            synced: false,
          },
        };
        dispatch(saveSocialMedia(newSocialMedia));
      }
    }
  };

export const setSyncSocialMediaEnabledThunk =
  (value: boolean) => async (dispatch: dispatch, getState: getState) => {
    const prevState = selectSyncSocialMediaEnabled(getState());

    dispatch(setSyncSocialMediaEnabled(value));
    try {
      if (value) {
        await dispatch(syncAndLinkSocialMedias());
      } else {
        await dispatch(removeAllSocialMedias());
      }
    } catch (e) {
      // rollback
      dispatch(setSyncSocialMediaEnabled(prevState));
    }
  };
