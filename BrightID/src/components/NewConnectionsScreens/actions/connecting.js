// @flow

import { randomKey } from '@/utils/encoding';
import { generateQrData } from '@/utils/qrCodes';
import { PROFILE_POLL_INTERVAL } from '@/utils/constants';
import { clearMyQrData, setMyQrData } from '@/actions/connectQrData';
import { encryptAndUploadProfile } from './encryptData';
import { fetchData } from './fetchData';

let profile_timer = 0;

export const startConnecting = () => async (dispatch: dispatch) => {
  try {
    // prepare QrCode data
    const aesKey = await randomKey(16);
    const qrCodeData = await generateQrData(aesKey);
    console.log(`Created new QRCodeData: ${qrCodeData.qrString}`);
    // upload my profile encrypted with aesKey
    dispatch(encryptAndUploadProfile(aesKey));
    // store my qr data in store
    dispatch(setMyQrData(qrCodeData));

    // start polling for uploaded profiles
    // TODO: Likely to be replaced with Notifications
    clearInterval(profile_timer);
    profile_timer = setInterval(() => {
      dispatch(fetchData());
    }, PROFILE_POLL_INTERVAL);

    // Start timer to expire QRdata and stop polling
    setTimeout(() => {
      console.log(`QrCode timer expired for qrString ${qrCodeData.qrString}`);
      dispatch(stopConnecting());
    }, qrCodeData.ttl);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

export const stopConnecting = () => (dispatch: dispatch) => {
  // stop polling for profiles
  clearInterval(profile_timer);
  // clear local qrCodeData
  dispatch(clearMyQrData());
};
