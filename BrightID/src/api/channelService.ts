/*
    Channel Service API

    Operations:

    - Upload data with unique ID to channel
        -> POST /profile/upload/${channelID}
    - Get list of data IDs in channel
        -> GET /profile/list/${channelID}
    - Download data from channel
        -> GET /profile/download/${channelID}/${dataID}

    We need to support multiple different hosts, so
    we can not use a global API instance. Instead it needs to be created per channel.
 */
import { create, ApiSauceInstance } from 'apisauce';

declare type UploadParams = {
  channelId: string;
  data: any;
  dataId: string;
};

declare type DownloadParams = {
  channelId: string;
  dataId: string;
};

class ChannelAPI {
  api: ApiSauceInstance;

  constructor(baseURL: string) {
    this.api = create({
      baseURL,
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  static throwOnError(response: any) {
    if (response.ok) {
      return;
    }
    if (response.data && response.data.error) {
      throw new Error(response.data.error);
    }
    throw new Error(response.problem);
  }

  async upload(params: UploadParams) {
    const { channelId, data, dataId } = params;
    const body = JSON.stringify({ data, uuid: dataId });
    const result = await this.api.post(`/upload/${channelId}`, body);
    ChannelAPI.throwOnError(result);
  }

  async list(channelId: string) {
    const result = await this.api.get(`/list/${channelId}`);
    ChannelAPI.throwOnError(result);
    if (result.data && result.data.profileIds) {
      return result.data.profileIds;
    } else {
      throw new Error(
        `list for channel ${channelId}: Unexpected response format`,
      );
    }
  }

  async download(params: DownloadParams) {
    const { channelId, dataId } = params;
    const result = await this.api.get(`/download/${channelId}/${dataId}`);
    ChannelAPI.throwOnError(result);
    if (result.data && result.data.data) {
      return result.data.data;
    } else {
      throw new Error(
        `download ${dataId} from channel ${channelId}: Unexpected response format`,
      );
    }
  }
}

export default ChannelAPI;