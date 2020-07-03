// @flow

import { generateChannelData } from '@/utils/qrCodes';
import { removeConnectQrData } from '@/actions/connectQrData';
import {
  createMyChannel,
  removeChannel,
} from '@/components/NewConnectionsScreens/channelSlice';
import { encryptAndUploadProfileToChannel } from './profile';

// TODO:
//  - Rename to "createMyChannel"
//  - move to channelSlice (using createAsyncThunk() utility function)
//  - get rid of this file
export const startConnecting = () => async (
  dispatch: dispatch,
  getState: () => State,
) => {
  try {
    // create new channel
    const channel = await generateChannelData();
    dispatch(createMyChannel(channel));

    // upload my encrypted profile
    dispatch(encryptAndUploadProfileToChannel(channel.id));

    // remove old QR data
    dispatch(removeConnectQrData());

    // Start timer to expire channel
    setTimeout(() => {
      console.log(`timer expired for channel ${channel.id}`);
      dispatch(removeChannel(channel.id));
    }, channel.ttl);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
