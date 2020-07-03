import qrcode from 'qrcode';
import { parseString } from 'xml2js';
import { Buffer } from 'buffer';
import api from '@/Api/BrightId';
import { b64ToUrlSafeB64, randomKey, b64ToUint8Array } from '@/utils/encoding';
import { QR_TTL, QR_TYPE_INITIATOR } from './constants';

export const generateChannelData = async () => {
  const aesKey = await randomKey(16);
  const ipAddress = await api.ip();
  const b64Ip = Buffer.from(
    ipAddress.split('.').map((octet) => parseInt(octet, 10)),
  )
    .toString('base64')
    .substring(0, 6);
  const idKey = await randomKey(9);
  const id = b64ToUrlSafeB64(idKey);
  const timestamp = Date.now();
  const ttl = QR_TTL;
  return { id, aesKey, timestamp, ttl, b64Ip };
};

export const generateQrData = async () => {
  const aesKey = await randomKey(16);
  var ipAddress = await api.ip();
  const b64Ip = Buffer.from(
    ipAddress.split('.').map((octet) => parseInt(octet, 10)),
  )
    .toString('base64')
    .substring(0, 6);
  const uuidKey = await randomKey(9);
  const uuid = b64ToUrlSafeB64(uuidKey);
  const timestamp = Date.now();
  const ttl = QR_TTL;
  const qrString = encodeURIComponent(`${aesKey}${uuid}${b64Ip}`);
  const type = QR_TYPE_INITIATOR;
  return { aesKey, uuid, ipAddress, qrString, timestamp, ttl, type };
};

export const qrCodeToSvg = (qrString, callback) => {
  qrcode.toString(qrString, (err, qr) => {
    if (err) return console.log(err);
    parseString(qr, (err, qrSvg) => {
      if (err) return console.log(err);
      callback(qrSvg);
    });
  });
};

export const parseQrData = (qrString) => {
  const decodedQR = decodeURIComponent(qrString);
  const aesKey = decodedQR.substr(0, 24);
  const uuid = decodedQR.substr(24, 12);
  const b64ip = `${decodedQR.substr(36, 6)}==`;
  const ipAddress = b64ToUint8Array(b64ip).join('.');
  return { aesKey, uuid, ipAddress, qrString };
};

export const encodeChannelQrData = (channel, profileId) => {
  const { aesKey, id: channelId, b64Ip } = channel;
  const qrString = encodeURIComponent(
    `${aesKey}${channelId}${profileId}${b64Ip}`,
  );
  return qrString;
};

export const parseChannelQrData = (qrString) => {
  const decodedQR = decodeURIComponent(qrString);
  const aesKey = decodedQR.substr(0, 24);
  const channelId = decodedQR.substr(24, 12);
  const profileId = decodedQR.substr(36, 12);
  const b64ip = `${decodedQR.substr(48, 6)}==`;
  const ipAddress = b64ToUint8Array(b64ip).join('.');
  return { aesKey, channelId, profileId, ipAddress, qrString };
};
