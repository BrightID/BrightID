import { find, propEq } from 'ramda';
import socialMediaService, { socialMediaUrl } from '@/api/socialMediaService';
import { BrightIdNetwork, linkAppId } from '@/components/Apps/model';
import store, { useSelector } from '@/store';
import { selectAllApps } from '@/reducer/appsSlice';

export const saveAndLinkSocialMedia = async (
  socialMediaVariation: SocialMediaVariation,
  prevProfile: SocialMedia,
  newProfile: string,
): Promise<BrightIdSocialAppData> => {
  const brightIdSocialAppData: BrightIdSocialAppData = {
    synced: false,
    linked: false,
    contextId: null,
    token: null,
    ...prevProfile?.brightIdSocialAppData,
  };
  let { synced, token, contextId, linked } = brightIdSocialAppData;

  if (!token || prevProfile?.profile !== newProfile || !synced) {
    synced = false;
    const data = await socialMediaService.setSocialMedia({
      token,
      profile: newProfile,
      variation: socialMediaVariation.id,
      network: __DEV__ ? BrightIdNetwork.TEST : BrightIdNetwork.NODE,
    });
    token = data.token;
    contextId = data.contextId;
  }

  const appId = socialMediaVariation.brightIdAppName;
  if (appId) {
    const apps = selectAllApps(store.getState());
    const appInfo = find(propEq('id', appId))(apps) as AppInfo;
    if (!linked) {
      if (appInfo && appInfo.usingBlindSig) {
        linked = await linkAppId(
          appId,
          contextId,
          `${socialMediaUrl}/v1/social-media/check-verification/`,
          true,
        );
      }
    }
  }
  return { synced, token, contextId, linked };
};
