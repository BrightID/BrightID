import qrcode from 'qrcode';
import { parseString } from 'xml2js';
import { Buffer } from 'buffer';
import api from '@/api/node';
import { b64ToUrlSafeB64, randomKey } from '@/utils/encoding';
import { QR_TTL } from './constants';

export const generateQrData = async (aesKey) => {
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
  const qrString = `${aesKey}${uuid}${b64Ip}`;
  return { aesKey, uuid, ipAddress, qrString, timestamp, ttl };
};

export const codeToSvg = (qrString, callback) => {
  qrcode.toString(qrString, (err, qr) => {
    if (err) return console.log(err);
    parseString(qr, (err, qrSvg) => {
      if (err) return console.log(err);
      callback(qrSvg);
    });
  });
};
