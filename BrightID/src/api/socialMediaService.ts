import { create, ApisauceInstance, ApiResponse } from 'apisauce';
import {
  SetSocialMediaRequest,
  SetSocialMediaResponse,
} from '@/api/socialMediaService_types.d';

export const socialMediaUrl = 'http://168.119.127.117:8090/api';

class SocialMediaService {
  socialMediaApi: ApisauceInstance;

  constructor() {
    this.socialMediaApi = create({
      baseURL: socialMediaUrl,
    });
  }

  static throwOnError(response: ApiResponse<any>) {
    if (response.ok) {
      return;
    }
    if (response.data && response.data.errorMessage) {
      throw new Error(response.data.errorMessage);
    }
    console.log(
      `socialApi response error: ${response.status} - ${response.problem}`,
    );
    throw new Error(response.problem);
  }

  async setSocialMedia({
    token,
    variation,
    profile,
    network,
  }: SetSocialMediaRequest) {
    const res = await this.socialMediaApi.post<SetSocialMediaResponse>(
      '/v1/social-media/set/',
      {
        variation,
        profile,
        network,
      },
      {
        headers: token
          ? {
              Authorization: `Token ${token}`,
            }
          : null,
      },
    );
    SocialMediaService.throwOnError(res);
    return res.data;
  }

  async deleteSocialMediaProfile(token: string) {
    const res = await this.socialMediaApi.delete(
      '/v1/social-media/delete/',
      {},
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    SocialMediaService.throwOnError(res);
  }
}

const socialMediaService = new SocialMediaService();

export default socialMediaService;
