import { BrightIdNetwork } from '@/components/Apps/model';

type SetSocialMediaRequest = {
  token?: string;
  variation: string;
  profile: string;
  network: BrightIdNetwork;
};

type SetSocialMediaResponse = {
  contextId: string;
  token: string;
  variation: string;
  profile: string;
  network: BrightIdNetwork;
};
