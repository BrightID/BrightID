// @flow

import { saveImage } from '@/utils/filesystem';
import { decryptData } from '@/utils/cryptoHelper';
import { hash } from '@/utils/encoding';
import { addConnection, createGroup } from '@/actions';
import { setSig, updateNamePhoto } from '../recoveryDataSlice';

export const loadRecoveryData = async (
  channelApi: any,
  aesKey: string,
): { signingKey: string, timestamp: number } => {
  try {
    let data = await channelApi.download({
      channelId: hash(aesKey),
      dataId: 'data',
    });
    if (!data.signingKey || !data.timestamp) {
      throw new Error(
        'Please ask the connection to reload their QR code and try again',
      );
    } else {
      return data;
    }
  } catch (err) {
    throw new Error('Bad QR Data');
  }
};

const downloadConnection = async ({
  dataId,
  channelApi,
  aesKey,
  channelId,
}) => {
  const encrypted = await channelApi.download({ channelId, dataId });
  const connectionData = decryptData(encrypted, aesKey);

  console.log(`Downloading profile data of ${connectionData?.id} ...`);

  const filename = await saveImage({
    imageName: connectionData.id,
    base64Image: connectionData.photo,
  });
  connectionData.photo = { filename };

  return connectionData;
};

export const downloadConnections = ({ channelApi, dataIds }) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const {
    recoveryData: {
      id: recoveryId,
      aesKey,
      channel: { channelId },
    },
    connections: { connections },
  } = getState();

  const existingConnIds = connections.map((c) => c.id);

  const isConn = (id) => id.startsWith('connection_');
  const connId = (id) => id.replace('connection_', '');

  const connectionDataIds = dataIds.filter(
    (id) =>
      isConn(id) &&
      !existingConnIds.includes(connId(id)) &&
      connId(id) !== recoveryId,
  );

  for (let dataId of connectionDataIds) {
    let connectionData = await downloadConnection({
      dataId,
      channelApi,
      aesKey,
      channelId,
    });

    dispatch(addConnection(connectionData));
  }
  return connectionDataIds.length;
};

export const downloadNamePhoto = ({ channelApi, dataIds }) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const {
    recoveryData: {
      id: recoveryId,
      aesKey,
      channel: { channelId },
    },
  } = getState();

  const connId = (id) => id.replace('connection_', '');

  const dataId = dataIds.find((id) => connId(id) === recoveryId);

  let connectionData = await downloadConnection({
    dataId,
    channelApi,
    aesKey,
    channelId,
  });

  let {
    recoveryData: { name },
  } = getState();

  if (!name) {
    dispatch(updateNamePhoto(connectionData));
    return true;
  } else {
    return false;
  }
};

const downloadGroup = async ({ dataId, channelApi, aesKey, channelId }) => {
  const encrypted = await channelApi.download({ channelId, dataId });
  const groupData = decryptData(encrypted, aesKey);
  const filename = await saveImage({
    imageName: groupData.id,
    base64Image: groupData.photo,
  });
  groupData.photo = { filename };
  return groupData;
};

export const downloadGroups = ({ channelApi, dataIds }) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const {
    recoveryData: {
      aesKey,
      channel: { channelId },
    },
    groups: { groups },
  } = getState();

  const existingGroupIds = groups.map((c) => c.id);

  const isGroup = (id) => id.startsWith('group_');
  const groupId = (id) => id.replace('group_', '');

  const groupDataIds = dataIds.filter(
    (id) => isGroup(id) && !existingGroupIds.includes(groupId(id)),
  );

  for (let dataId of groupDataIds) {
    let groupData = await downloadGroup({
      dataId,
      channelApi,
      aesKey,
      channelId,
    });
    dispatch(createGroup(groupData));
  }
  return groupDataIds.length;
};

export const downloadSigs = ({ channelApi, dataIds }) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const {
    recoveryData: {
      sigs,
      channel: { channelId },
    },
  } = getState();

  const isSig = (id) => id.startsWith('sig_');
  const sigId = (id) => id.replace('sig_', '');

  const sigDataIds = dataIds.filter((id) => isSig(id) && !sigs[sigId(id)]);

  for (let dataId of sigDataIds) {
    const signer = sigId(dataId);
    const sig = await channelApi.download({ channelId, dataId });
    dispatch(setSig({ signer, sig }));
  }
  return sigDataIds.length;
};
