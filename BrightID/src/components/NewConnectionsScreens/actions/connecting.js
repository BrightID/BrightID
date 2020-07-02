// @flow

import { generateQrData } from '@/utils/qrCodes';
import { PROFILE_POLL_INTERVAL } from '@/utils/constants';
import {
  clearMyQrData,
  setMyQrData,
  removeConnectQrData,
} from '@/actions/connectQrData';

import { encryptAndUploadProfile, fetchProfile } from './profile';

let fetchProfileID: IntervalID;

export const startConnecting = () => async (
  dispatch: dispatch,
  getState: () => State,
) => {
  try {
    // prepare QrCode data
    const qrCodeData = await generateQrData();
    console.log(`Created new QRCodeData: ${qrCodeData.qrString}`);
    // upload my encrypted profile
    dispatch(encryptAndUploadProfile(qrCodeData));
    // store my qr data in store
    dispatch(setMyQrData(qrCodeData));
    // remove old QR data
    dispatch(removeConnectQrData());
    // start polling for uploaded profiles from people scanning my code
    clearInterval(fetchProfileID);
    fetchProfileID = setInterval(() => {
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

export const stopConnecting = () => (
  dispatch: dispatch,
  getState: () => State,
) => {
  // stop polling for profiles
  clearInterval(fetchProfileID);
  // clear local qrCodeData
  dispatch(clearMyQrData());
  // remove old QR data
};
