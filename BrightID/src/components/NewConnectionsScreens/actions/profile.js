import { QR_TYPE_INITIATOR, QR_TYPE_RESPONDER } from '@/utils/constants';
import { decryptData, encryptData } from '@/utils/cryptoHelper';
import { postProfile, postProfileToChannel } from '@/utils/profile';
import { retrieveImage } from '@/utils/filesystem';
import emitter from '@/emitter';
import {
  selectChannelById,
  setMyProfileId,
} from '@/components/NewConnectionsScreens/channelSlice';
import { removeConnectUserData, setConnectUserData } from '../../../actions';
// import { stopConnecting } from './connecting';

// @flow

export const encryptAndUploadProfileToChannel = (
  channelId,
  timestamp,
  signedMessage,
) => async (dispatch: dispatch, getState: getState) => {
  // get channel
  const channel = selectChannelById(getState(), channelId);
  // get user data
  const {
    user: {
      id,
      photo: { filename },
      name,
      score,
    },
  } = getState();
  try {
    // retrieve photo
    const photo = await retrieveImage(filename);
    const dataObj = {
      id,
      photo,
      name,
      score,
      signedMessage,
      timestamp,
      // TODO: create notification token!
      push_token: undefined,
    };

    console.log(`Encrypting profile data with key ${channel.aesKey}`);
    let encrypted = encryptData(dataObj, channel.aesKey);
    console.log(`Posting profile data...`);
    const profileId = await postProfileToChannel(encrypted, channel);
    dispatch(setMyProfileId(profileId));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

export const encryptAndUploadProfile = (
  qrCodeData,
  timestamp,
  signedMessage,
) => async (dispatch: dispatch, getState: getState) => {
  const {
    user: {
      id,
      photo: { filename },
      name,
      score,
    },
  } = getState();
  try {
    // retrieve photo
    const photo = await retrieveImage(filename);
    const dataObj = {
      id,
      // publicKey is added to make it compatible with earlier version
      publicKey: id,
      photo,
      name,
      score,
      signedMessage,
      timestamp,
    };

    console.log(`Encrypting profile data with key ${qrCodeData.aesKey}`);
    let encrypted = encryptData(dataObj, qrCodeData.aesKey);
    console.log(`Posting profile data...`);
    await postProfile(encrypted, qrCodeData);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

/*
  Look for profile. url/channel and decryption key is specified by qrCodeData
 */
export const fetchProfile = (qrCodeData) => async (
  dispatch: () => null,
  getState: () => {},
) => {
  let { ipAddress, channel, aesKey, type } = qrCodeData;
  if (!channel) return;

  if (type === QR_TYPE_INITIATOR) {
    // I'm initiator and looking for profile responses, so add channel extension "2"
    channel += '2';
  } else if (type === QR_TYPE_RESPONDER) {
    // I'm responder and looking for the initial profile upload, so add channel extension "1"
    channel += '1';
  } else {
    console.log(`Unexpected qrCodeType ${type}`);
    return;
  }
  const url = `http://${ipAddress}/profile/download/${channel}`;
  // console.log(
  //   `fetching profile response data for channel ${channel} from ${url}`,
  // );

  try {
    const response = await fetch(url, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      throw new Error(
        `Profile download returned ${response.status}: ${response.statusText} for url: ${url}`,
      );
    }
    const profileData = await response.json();

    if (profileData && profileData.data) {
      try {
        // workaround: For now stop polling for profiles after the first profile is received,
        //  otherwise the same profile(s) will be downloaded again and again
        // dispatch(stopConnecting());
        const decryptedObj = decryptData(profileData.data, aesKey);

        dispatch(removeConnectUserData());
        dispatch(setConnectUserData(decryptedObj));
      } catch (err) {
        err instanceof Error ? console.warn(err.message) : console.log(err);
      }
    }
  } catch (err) {
    emitter.emit('connectFailure');
  }
};
