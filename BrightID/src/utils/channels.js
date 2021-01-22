// @flow
import { b64ToUrlSafeB64, randomKey } from '@/utils/encoding';
import {
  CHANNEL_TTL,
  CHANNEL_INFO_VERSION,
  CHANNEL_INFO_NAME,
} from '@/utils/constants';
import { channel_states } from '@/components/PendingConnectionsScreens/channelSlice';
import ChannelAPI from '@/api/channelService';
import i18next from 'i18next';

export const createRandomId = async (size: number = 9) => {
  const key = await randomKey(size);
  return b64ToUrlSafeB64(key);
};

export const generateChannelData = async (
  channelType: ChannelType,
  url: URL,
): Promise<Channel> => {
  const aesKey = await randomKey(16);
  const id = await createRandomId();
  const timestamp = Date.now();
  const ttl = CHANNEL_TTL;
  const myProfileId = await createRandomId();
  const type = channelType;
  const initiatorProfileId = '';
  const state = channel_states.OPEN;
  const channelApi = new ChannelAPI(url.href);

  return {
    aesKey,
    api: channelApi,
    id,
    initiatorProfileId,
    myProfileId,
    state,
    timestamp,
    ttl,
    type,
    url,
  };
};

export const createChannelInfo = (channel: Channel) => {
  const obj: ChannelInfo = {
    version: CHANNEL_INFO_VERSION,
    type: channel.type,
    timestamp: channel.timestamp,
    ttl: channel.ttl,
    initiatorProfileId: channel.myProfileId,
  };
  return obj;
};

export const buildChannelQrUrl = ({ aesKey, id, url }: Channel) => {
  const qrUrl = new URL(url.href);
  qrUrl.searchParams.append('aes', aesKey);
  qrUrl.searchParams.append('id', id);
  return qrUrl;
};

export const parseChannelQrURL = async (url: URL) => {
  // parse and remove aesKey from URL
  const aesKey = url.searchParams.get('aes');
  url.searchParams.delete('aes');
  // parse and remove channelID from URL
  const id = url.searchParams.get('id');
  url.searchParams.delete('id');

  // create channelAPI
  const channelApi = new ChannelAPI(url.href);
  // download channelInfo
  const channelInfo = await channelApi.download({
    channelId: id,
    dataId: CHANNEL_INFO_NAME,
  });
  console.log(`Got ChannelInfo:`);
  console.log(channelInfo);

  if (channelInfo.version > CHANNEL_INFO_VERSION) {
    const msg = i18next.t(
      'channel.alert.text.localOutdated',
      'client version outdated - please update your client and retry',
    );
    throw new Error(msg);
  } else if (channelInfo.version < CHANNEL_INFO_VERSION) {
    const msg = i18next.t(
      'channel.alert.text.otherOutdated',
      'other client version outdated - QRCode creator needs to update client and retry',
    );
    throw new Error(msg);
  }

  const myProfileId = await createRandomId();

  const channel: Channel = {
    aesKey,
    api: channelApi,
    id,
    initiatorProfileId: channelInfo.initiatorProfileId,
    myProfileId,
    state: channel_states.OPEN,
    timestamp: channelInfo.timestamp,
    ttl: channelInfo.ttl,
    type: channelInfo.type,
    url,
  };
  return channel;
};
