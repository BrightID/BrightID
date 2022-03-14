import { BrightIdNetwork } from '@/components/Apps/model';
import { SocialMediaVariationIds } from '@/components/EditProfile/socialMediaVariations';

type CreateSocialMediaRequest = {
  variation: string;
  profileHashes: string[];
  network: BrightIdNetwork;
};

type CreateSocialMediaResponse = {
  contextId: string;
  token: string;
  variation: string;
  network: BrightIdNetwork;
};

type UpdateSocialMediaRequest = {
  token: string;
  profileHashes: string[];
};

type SocialMediaQueryRequest = {
  network: BrightIdNetwork;
  profileHashes: string[];
};

type SocialMediaQueryResponse = string[];
