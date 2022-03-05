import { create, ApisauceInstance, ApiResponse } from 'apisauce';
import {
  CreateSocialMediaRequest,
  CreateSocialMediaResponse,
  UpdateSocialMediaRequest,
  UpdateSocialMediaResponse,
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

  async createSocialMedia({
    variation,
    profile,
    network,
  }: CreateSocialMediaRequest) {
    const res = await this.socialMediaApi.post<CreateSocialMediaResponse>(
      '/v1/social-media/create/',
      {
        variation,
        profile,
        network,
      },
    );
    SocialMediaService.throwOnError(res);
    return res.data;
  }

  async updateSocialMedia({ token, profile }: UpdateSocialMediaRequest) {
    const res = await this.socialMediaApi.put<UpdateSocialMediaResponse>(
      '/v1/social-media/update/',
      {
        profile,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
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
