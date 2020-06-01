// @flow

import { QR_TYPE_INITIATOR, QR_TYPE_RESPONDER } from '@/utils/constants';

export const postProfile = async (data: string, QrCodeData) => {
  let { ipAddress, uuid, type } = QrCodeData;

  if (type === QR_TYPE_INITIATOR) {
    // I'm initiator so add extension "1"
    uuid += '1';
  } else if (type === QR_TYPE_RESPONDER) {
    // I'm responder so add extension "2"
    uuid += '2';
  } else {
    console.log(`Unexpected qrCodeType ${type}`);
    return;
  }

  const url = `http://${ipAddress}/profile/upload`;
  const body = JSON.stringify({ data, uuid });
  console.log(`Posting profile to ${url}, uuid ${uuid}`);
  await postData(url, body);
};

const postData = async (url: string, body: string) => {
  try {
    const result = await fetch(url, {
      method: 'POST', // or 'PUT'
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (result.status === 200) {
      console.log('successfully uploaded data');
    } else {
      throw Error(`Unexpected http status ${result.status}`);
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
