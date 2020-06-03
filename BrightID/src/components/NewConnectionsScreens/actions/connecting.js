// @flow

import { generateQrData } from '@/utils/qrCodes';
import { PROFILE_POLL_INTERVAL } from '@/utils/constants';
import { clearMyQrData, setMyQrData } from '@/actions/connectQrData';
import { encryptAndUploadProfile, fetchProfile } from './profile';

let profile_timer: IntervalID;

export const startConnecting = () => async (dispatch: dispatch) => {
  try {
    // prepare QrCode data
    const qrCodeData = await generateQrData();
    console.log(`Created new QRCodeData: ${qrCodeData.qrString}`);
    // upload my encrypted profile
    dispatch(encryptAndUploadProfile(qrCodeData));
    // store my qr data in store
    dispatch(setMyQrData(qrCodeData));

    // start polling for uploaded profiles from people scanning my code
    clearInterval(profile_timer);
    profile_timer = setInterval(() => {
      dispatch(fetchProfile(qrCodeData));
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
