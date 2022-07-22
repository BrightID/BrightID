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
import { create, ApisauceInstance, ApiResponse } from 'apisauce';
import {
  CHANNEL_EXPIRES_HEADER,
  CHANNEL_UPLOAD_RETRY_COUNT,
  CHANNEL_UPLOAD_RETRY_INTERVAL,
} from '@/utils/constants';

type UploadParams = {
  channelId: string;
  data: any;
  dataId: string;
  // Use requestedTtl to override default channel TTL on the backend. Only taken into account when
  // creating a channel (upload of first entry).
  requestedTtl?: number;
};

type UploadResult = {
  expires: number;
};

type DownloadParams = {
  channelId: string;
  dataId: string;
  deleteAfterDownload?: boolean;
};

type DownloadResult = {
  data: any;
  expires: number;
};

type ListResult = {
  entries: Array<string>;
  expires: number;
};

class ChannelAPI {
  api: ApisauceInstance;

  constructor(baseURL: string) {
    this.api = create({
      baseURL,
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  static throwOnError(response: ApiResponse<any>) {
    if (response.ok) {
      return;
    }
    if (response.data && response.data.error) {
      throw new Error(response.data.error);
    }
    throw new Error(response.problem);
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    const { channelId, data, dataId, requestedTtl } = params;

    // convert TTL from ms to seconds
    const requestedTtlSecs = requestedTtl
      ? Math.floor(requestedTtl / 1000)
      : undefined;

    const body = JSON.stringify({
      data,
      uuid: dataId,
      requestedTtl: requestedTtlSecs,
    });

    let retries = 0;
    let result = await this.api.post(`/upload/${channelId}`, body);

    // Upload failed. Wait to try again with increasing delay, give up after max attempts
    while (!result.ok && retries < CHANNEL_UPLOAD_RETRY_COUNT) {
      retries++;
      const retryDelay = CHANNEL_UPLOAD_RETRY_INTERVAL * retries;
      console.log(
        `Uploading ${dataId} to ${channelId} failed with status ${
          result.status
        } at try ${retries - 1}. Retrying in ${retryDelay}ms.`,
      );
      await new Promise((r) => setTimeout(r, retryDelay));
      result = await this.api.post(`/upload/${channelId}`, body);
    }
    ChannelAPI.throwOnError(result);
    const expires = parseInt(result.headers[CHANNEL_EXPIRES_HEADER], 10);
    return { expires };
  }

  async list(channelId: string): Promise<ListResult> {
    const result = await this.api.get<{ profileIds: string[] }>(
      `/list/${channelId}`,
    );
    ChannelAPI.throwOnError(result);
    const expires = parseInt(result.headers[CHANNEL_EXPIRES_HEADER], 10);
    if (result.data && result.data.profileIds) {
      return {
        entries: result.data.profileIds,
        expires,
      };
    } else {
      throw new Error(
        `list for channel ${channelId}: Unexpected response format`,
      );
    }
  }

  async download(params: DownloadParams): Promise<DownloadResult> {
    const { channelId, dataId, deleteAfterDownload } = params;
    const result = await this.api.get<{ data: any }>(
      `/download/${channelId}/${dataId}`,
    );
    ChannelAPI.throwOnError(result);
    let expires = parseInt(result.headers[CHANNEL_EXPIRES_HEADER], 10);
    if (deleteAfterDownload) {
      try {
        const deleteResult = await this.api.delete(`/${channelId}/${dataId}`);
        expires = parseInt(deleteResult.headers[CHANNEL_EXPIRES_HEADER], 10);
      } catch (e) {
        console.log(
          `Ignoring error while deleting ${dataId} from channel ${channelId}: ${e}`,
        );
      }
    }
    if (result.data && result.data.data) {
      return {
        data: result.data.data,
        expires,
      };
    } else {
      throw new Error(
        `download ${dataId} from channel ${channelId}: Unexpected response format`,
      );
    }
  }
}

export default ChannelAPI;
