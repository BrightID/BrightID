// @flow
import { b64ToUint8Array, b64ToUrlSafeB64, randomKey } from '@/utils/encoding';
import {
  CHANNEL_TTL,
  CHANNEL_INFO_VERSION,
  CHANNEL_INFO_NAME,
} from '@/utils/constants';
import { Buffer } from 'buffer';
import {
  channel_states,
  channel_types,
} from '@/components/PendingConnectionsScreens/channelSlice';
import ChannelAPI from '@/api/channelService';
import i18next from 'i18next';

export const createRandomId = async (size: number = 9) => {
  const key = await randomKey(size);
  return b64ToUrlSafeB64(key);
};

export const generateChannelData = async (
  channelType: ChannelType,
  url: URL,
  ipAddress?: string,
): Promise<Channel> => {
  const aesKey = await randomKey(16);
  const id = await createRandomId();
  const timestamp = Date.now();
  const ttl = CHANNEL_TTL;
  const myProfileId = await createRandomId();
  const type = channelType;
  const initiatorProfileId = '';
  const state = channel_states.OPEN;
  const channelApi = new ChannelAPI(`${url.href}`);

  return {
    aesKey,
    api: channelApi,
    id,
    initiatorProfileId,
    ipAddress,
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

export const encodeChannelQrString = (channel: Channel) => {
  const { aesKey, id, ipAddress, myProfileId, timestamp, ttl, type } = channel;
  if (!ipAddress) {
    throw Error(`Cant create old format channelQRString - ipAddress missing`);
  }
  const b64Ip = Buffer.from(
    ipAddress.split('.').map((octet) => parseInt(octet, 10)),
  )
    .toString('base64')
    .substring(0, 6);
  let intType;
  switch (type) {
    case channel_types.GROUP:
      intType = 0;
      break;
    case channel_types.SINGLE:
      intType = 1;
      break;
    default:
      throw new Error(`Unhandled channel type ${type}`);
  }
  return encodeURIComponent(
    `${aesKey}${id}${myProfileId}${b64Ip}${intType}${timestamp}${ttl}`,
  );
};

export const decodeChannelQrString = async (qrString: string) => {
  const decodedQR = decodeURIComponent(qrString);
  const aesKey = decodedQR.substr(0, 24);
  const id = decodedQR.substr(24, 12);
  const initiatorProfileId = decodedQR.substr(36, 12);
  const b64ip = `${decodedQR.substr(48, 6)}==`;
  const ipAddress = b64ToUint8Array(b64ip).join('.');
  const intType = parseInt(decodedQR.substr(54, 1), 10);
  // 13 digits for timestamp will be safe until Saturday, 20. November 2286 17:46:39.999
  const timestamp = parseInt(decodedQR.substr(55, 13), 10);
  // ttl has unknown length, so just parse everything till the end
  const ttl = parseInt(decodedQR.substr(68), 10);

  // add local channel data that is not part of qrstring
  const myProfileId = await createRandomId();
  const state = channel_states.OPEN;
  const url = new URL(`http://${ipAddress}/profile`);
  const channelApi = new ChannelAPI(url.href);

  // convert intType to ChannelType
  let type;
  switch (intType) {
    case 0:
      type = channel_types.GROUP;
      break;
    case 1:
      type = channel_types.SINGLE;
      break;
    default:
      throw new Error(`Unhandled channel intType ${intType}`);
  }

  const channel: Channel = {
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
  return channel;
};
