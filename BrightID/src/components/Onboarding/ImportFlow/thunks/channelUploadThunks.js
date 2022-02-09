import { hash } from '@/utils/encoding';
import { selectAllConnections } from '@/reducer/connectionsSlice';
import {
  uploadConnection,
  uploadGroup
} from '@/components/Onboarding/RecoveryFlow/thunks/channelUploadThunks';

export const uploadAllInfo = ({
  aesKey,
  channelApi,
}) => async (dispatch, getState) => {
  try {
    const dataIds = await channelApi.list(hash(aesKey));
    const {
      groups: { groups },
      user,
    } = getState();
    const connections = selectAllConnections(getState());
    connections.unshift(user);

    // uploading a dummy sig to set user id on the other side
    console.log('uploading user id');
    const data = { signer: user.id, id: user.id, sig: 'dummy sig' };
    await channelApi.upload({
      channelId: hash(aesKey),
      dataId: `sig_${user.id}`,
      data,
    });

    console.log('uploading connections');
    for (const conn of connections) {
      if (!dataIds.includes(`connection_${conn.id}`)) {
        await uploadConnection({ conn, channelApi, aesKey });
      }
    }

    console.log('uploading groups');
    for (const group of groups) {
      if (!dataIds.includes(`group_${group.id}`)) {
        await uploadGroup({ group, channelApi, aesKey });
      }
    }

    console.log('uploading completed flag');
    await channelApi.upload({
      channelId: hash(aesKey),
      dataId: `completed_${user.id}`,
      data: 'completed',
    });
  } catch (err) {
    console.error(`uploadAllInfo: ${err.message}`);
  }
};
