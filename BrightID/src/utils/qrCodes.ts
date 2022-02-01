import qrcode from 'qrcode';
import { parseString } from 'xml2js';

export const qrCodeToSvg = (qrString: string, callback: (string) => void) => {
  qrcode.toString(qrString, (err, qr) => {
    if (err) return console.log(err);
    parseString(qr, (err, qrSvg) => {
      if (err) return console.log(err);
      callback(qrSvg);
    });
  });
};
