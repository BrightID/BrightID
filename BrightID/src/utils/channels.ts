import { urlSafeRandomKey } from '@/utils/encoding';
import {
  CHANNEL_TTL,
  CHANNEL_INFO_NAME,
  MIN_CHANNEL_INFO_VERSION,
  CHANNEL_INFO_VERSION_1,
  CHANNEL_INFO_VERSION_2,
  MAX_CHANNEL_INFO_VERSION,
} from '@/utils/constants';
import {
  channel_states,
  channel_types,
} from '@/components/PendingConnections/channelSlice';
import ChannelAPI from '@/api/channelService';
import i18next from 'i18next';

export const generateChannelData = async (
  channelType: ChannelType,
  url: URL,
): Promise<Channel> => {
  const aesKey = await urlSafeRandomKey(16);
  const id = await urlSafeRandomKey(9);
  const timestamp = Date.now();
  const ttl = CHANNEL_TTL;
  const myProfileId = await urlSafeRandomKey(9);
  const initiatorProfileId = myProfileId;
  const type = channelType;
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
  /*
    Channel types "SINGLE" and "GROUP" are compatible with CHANNEL_INFO_VERSION 1.
    Channel type "STAR" requires CHANNEL_INFO_VERSION 2
   */
  let version;
  switch (channel.type) {
    case channel_types.SINGLE:
    case channel_types.GROUP:
      version = CHANNEL_INFO_VERSION_1;
      break;
    case channel_types.STAR:
      version = CHANNEL_INFO_VERSION_2;
      break;
    default:
      throw new Error(`Unhandled channel type ${channel.type}`);
  }
  const obj: ChannelInfo = {
    version,
    type: channel.type,
    timestamp: channel.timestamp,
    ttl: channel.ttl,
    initiatorProfileId: channel.initiatorProfileId,
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

  if (channelInfo.version > MAX_CHANNEL_INFO_VERSION) {
    const msg = i18next.t(
      'channel.alert.text.localOutdated',
      'client version outdated - please update your client and retry',
    );
    throw new Error(msg);
  } else if (channelInfo.version < MIN_CHANNEL_INFO_VERSION) {
    const msg = i18next.t(
      'channel.alert.text.otherOutdated',
      'other client version outdated - QRCode creator needs to update client and retry',
    );
    throw new Error(msg);
  }

  const myProfileId = await urlSafeRandomKey(9);

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
