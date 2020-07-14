// @flow
import { b64ToUint8Array, b64ToUrlSafeB64, randomKey } from '@/utils/encoding';
import api from '@/Api/BrightId';
import { CHANNEL_TTL } from '@/utils/constants';
import { Buffer } from 'buffer';
import { channel_states } from '@/components/NewConnectionsScreens/channelSlice';

export const createRandomId = async (size: number = 9) => {
  const key = await randomKey(size);
  return b64ToUrlSafeB64(key);
};

export const generateChannelData = async (
  channelType: number,
): Promise<Channel> => {
  const aesKey = await randomKey(16);
  const ipAddress = await api.ip();
  const id = await createRandomId();
  const timestamp = Date.now();
  const ttl = CHANNEL_TTL;
  const myProfileId = await createRandomId();
  const type = channelType;
  const initiatorProfileId = '';
  const state = channel_states.OPEN;

  return {
    aesKey,
    id,
    initiatorProfileId,
    ipAddress,
    myProfileId,
    state,
    timestamp,
    ttl,
    type,
  };
};

export const encodeChannelQrString = (channel: Channel) => {
  const { aesKey, id, ipAddress, myProfileId, timestamp, ttl, type } = channel;
  const b64Ip = Buffer.from(
    ipAddress.split('.').map((octet) => parseInt(octet, 10)),
  )
    .toString('base64')
    .substring(0, 6);
  return encodeURIComponent(
    `${aesKey}${id}${myProfileId}${b64Ip}${type}${timestamp}${ttl}`,
  );
};

export const decodeChannelQrString = async (qrString: string) => {
  const decodedQR = decodeURIComponent(qrString);
  const aesKey = decodedQR.substr(0, 24);
  const id = decodedQR.substr(24, 12);
  const initiatorProfileId = decodedQR.substr(36, 12);
  const b64ip = `${decodedQR.substr(48, 6)}==`;
  const ipAddress = b64ToUint8Array(b64ip).join('.');
  const type = parseInt(decodedQR.substr(54, 1), 10);
  // 13 digits for timestamp will be safe until Saturday, 20. November 2286 17:46:39.999
  const timestamp = parseInt(decodedQR.substr(55, 13), 10);
  // ttl has unknown length, so just parse everything till the end
  const ttl = parseInt(decodedQR.substr(68), 10);

  // add local channel data that is not part of qrstring
  const myProfileId = await createRandomId();
  const state = channel_states.OPEN;

  const channel: Channel = {
    aesKey,
    id,
    initiatorProfileId,
    ipAddress,
    myProfileId,
    state,
    timestamp,
    ttl,
    type,
  };
  return channel;
};
