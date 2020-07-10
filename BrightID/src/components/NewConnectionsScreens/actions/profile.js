// @flow
import { encryptData } from '@/utils/cryptoHelper';
import { postProfileToChannel } from '@/utils/profile';
import { retrieveImage } from '@/utils/filesystem';
import { selectChannelById } from '@/components/NewConnectionsScreens/channelSlice';

export const encryptAndUploadProfileToChannel = (channelId: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    // get channel
    const channel = selectChannelById(getState(), channelId);
    // get user data
    const {
      id,
      photo: { filename },
      name,
      score,
    } = getState().user;
    // retrieve photo
    const photo = await retrieveImage(filename);

    const dataObj = {
      id,
      photo,
      name,
      score,
    };

    console.log(`Encrypting profile data with key ${channel.aesKey}`);
    let encrypted = encryptData(dataObj, channel.aesKey);
    console.log(`Posting profile data...`);
    await postProfileToChannel(encrypted, channel);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
