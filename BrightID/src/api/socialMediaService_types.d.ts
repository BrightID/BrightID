import { BrightIdNetwork } from '@/components/Apps/model';

type CreateSocialMediaRequest = {
  variation: string;
  profile: string;
  network: BrightIdNetwork;
};

type CreateSocialMediaResponse = {
  contextId: string;
  token: string;
  variation: string;
  profile: string;
  network: BrightIdNetwork;
};

type UpdateSocialMediaRequest = {
  token: string;
  profile: string;
};

type UpdateSocialMediaResponse = {
  profile: string;
};

type QuerySocialMediaRequest = {
  network: BrightIdNetwork;
  profiles: string[];
};

type SocialMediaFriendRaw = {
  profile: string;
  variation: string;
};

type QuerySocialMediaResponse = SocialMediaFriendRaw[];
