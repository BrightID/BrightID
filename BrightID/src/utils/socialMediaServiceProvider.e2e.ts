import { SocialMediaService } from '@/api/socialMediaService';
import {
  SocialMediaQueryRequest,
  SocialMediaQueryResponse,
} from '@/api/socialMediaService_types';

const socialMediaService = new SocialMediaService();

// monkeypatch query function to always return all queried entries
socialMediaService.querySocialMedia = async (
  payload: SocialMediaQueryRequest,
) => {
  console.log(`Mocking socialMediaService`);
  return new Promise((resolve) => {
    const response: SocialMediaQueryResponse = payload.profileHashes;
    resolve(response);
  });
};

export default socialMediaService;
