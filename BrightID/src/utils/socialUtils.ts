import { SocialMediaVariationIds } from '@/components/EditProfile/socialMediaVariations';
import { extractDigits, parsePhoneNumber } from '@/utils/phoneUtils';
import { hashSocialProfile } from '@/utils/cryptoHelper';
import { DEFAULT_SHARE_WITH_CONNECTIONS_VALUE } from '@/utils/constants';

export function generateSocialProfileHashes(
  profile: string,
  socialMediaVariationId: string,
): string[] {
  if (socialMediaVariationId === SocialMediaVariationIds.PHONE_NUMBER) {
    const { number } = parsePhoneNumber(profile);
    const phoneNumberDigits = extractDigits(profile);
    return [
      hashSocialProfile(number),
      hashSocialProfile(phoneNumberDigits),
      hashSocialProfile(
        phoneNumberDigits.substring(phoneNumberDigits.length - 7),
      ),
    ];
  }
  return [hashSocialProfile(profile)];
}

export const getShareWithConnectionsValue = (
  socialMedia: SocialMedia,
): boolean => {
  return socialMedia.shareWithConnections === undefined
    ? DEFAULT_SHARE_WITH_CONNECTIONS_VALUE
    : socialMedia.shareWithConnections;
};
