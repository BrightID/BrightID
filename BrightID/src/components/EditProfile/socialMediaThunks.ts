import { SOCIAL_API_AUTHENTICATION_ERROR } from '@/api/socialMediaService';
import { getSignedTimestamp } from '@/components/Apps/model';
import {
  selectAllLinkedSigs,
  selectAllSigs,
  selectAppInfoByAppId,
  selectLinkingAppError,
} from '@/reducer/appsSlice';
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
import { BrightIdNetwork, SOCIAL_MEDIA_SIG_WAIT_TIME } from '@/utils/constants';
import socialMediaService from '@/utils/socialMediaServiceProvider';
import { requestLinking } from '@/components/Apps/appThunks';
import { isVerifiedForApp } from '@/utils/verifications';
import { selectUserVerifications } from '@/reducer/userSlice';

export const allowDiscovery = ({
  appInfo,
  userVerifications,
  sigs,
}: {
  appInfo: AppInfo;
  userVerifications: Verification[];
  sigs: Array<SigInfo>;
}) => {
  // has the user the required verifications to link?
  if (!isVerifiedForApp(userVerifications, appInfo.verifications)) return false;

  // is the elapsed time since creating signatures okay?
  const signedTimestamp = getSignedTimestamp(appInfo, sigs);
  if (signedTimestamp) {
    const elapsed = Date.now() - signedTimestamp;
    if (elapsed < SOCIAL_MEDIA_SIG_WAIT_TIME) {
      return false;
    }
  }
  // okay, user can enable discovery
  return true;
};

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

export const linkSocialMediaApp =
  ({
    appId,
    appUserId,
  }: {
    appId: string;
    appUserId: string;
  }): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    // check if we are already linked with that app
    const linkedSigs = selectAllLinkedSigs(getState()).filter(
      (sig) => sig.app === appId,
    );
    if (linkedSigs.length > 0) {
      console.log(`User already linked with app ${appId}`);
      return;
    }

    // check appInfo
    const appInfo = selectAppInfoByAppId(getState(), appId);
    if (!appInfo) throw Error(`App not found!`);
    if (!appInfo.usingBlindSig)
      throw Error(`App ${appInfo.name} is not using blind signatures!`);

    const userVerifications = selectUserVerifications(getState());
    const sigs = selectAllSigs(getState());
    // start linking if user meets all conditions
    if (allowDiscovery({ appInfo, userVerifications, sigs })) {
      const linkingAppInfo = {
        baseUrl: undefined,
        appId,
        appUserId,
        v: 6,
        skipSponsoring: true,
      };
      await dispatch(
        requestLinking({
          linkingAppInfo,
          skipUserConfirmation: true,
        }),
      );
      const error = selectLinkingAppError(getState());
      if (error) throw Error(error);
    } else {
      throw Error(
        `User can not activate discovery. Either verifications missing or sig timestamp invalid`,
      );
    }
  };

export const syncSocialMediaChanges =
  (incomingSocialMedia: SocialMedia): AppThunk<Promise<SocialMedia>> =>
  async (dispatch: AppDispatch, getState) => {
    const socialMediaVariation = selectSocialMediaVariationById(
      getState(),
      incomingSocialMedia.id,
    );
    const prevProfile = selectSocialMediaById(
      getState(),
      incomingSocialMedia.id,
    );
    const brightIdSocialAppData: BrightIdSocialAppData = {
      synced: false,
      appUserId: null,
      token: null,
      ...incomingSocialMedia.brightIdSocialAppData,
    };
    let { synced, token, appUserId } = brightIdSocialAppData;

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

    const socialMedia: SocialMedia = {
      ...incomingSocialMedia,
      brightIdSocialAppData: { synced, token, appUserId },
    };
    dispatch(saveSocialMedia(socialMedia));
    return socialMedia;
  };

export const saveAndSyncSocialMedia =
  (incomingSocialMedia: SocialMedia) =>
  async (dispatch: AppDispatch, _getState) => {
    // First, update locally, so the user doesn't need to wait for
    // the server to complete the request to see his new profile in the UI.
    dispatch(saveSocialMedia(incomingSocialMedia));

    if (incomingSocialMedia.discoverable) {
      // this social media should be synced with socialMediaService
      await dispatch(syncSocialMediaChanges(incomingSocialMedia));
    }
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
  (id: string): AppThunk =>
  async (dispatch: AppDispatch, getState) => {
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
  (): AppThunk => async (dispatch: AppDispatch, _) => {
    console.log(`updating socialMediaVariations...`);
    const socialMediaVariations =
      await socialMediaService.retrieveSocialMediaVariations();
    dispatch(upsertSocialMediaVariations(socialMediaVariations));
  };

export const saveAndSyncSocialMedias =
  (): AppThunk => async (dispatch: AppDispatch, getState) => {
    const socialMedias = selectAllSocialMedia(getState());
    socialMedias.forEach((socialMedia) => {
      if (socialMedia.profile) {
        dispatch(saveAndSyncSocialMedia(socialMedia));
      }
    });
  };

export const removeAllSocialMediasFromServer =
  (): AppThunk => async (dispatch: AppDispatch, getState) => {
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
