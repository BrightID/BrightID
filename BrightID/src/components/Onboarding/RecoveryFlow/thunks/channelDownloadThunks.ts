import ChannelAPI from '@/api/channelService';
import { saveImage } from '@/utils/filesystem';
import { decryptData } from '@/utils/cryptoHelper';
import { hash, b64ToUrlSafeB64 } from '@/utils/encoding';
import { addConnection, upsertGroup, selectAllConnections } from '@/actions';
import {
  RecoveryError,
  RecoveryErrorType,
} from '@/components/Onboarding/RecoveryFlow/RecoveryError';
import {
  setSig,
  updateNamePhoto,
  increaseRecoveredConnections,
  increaseRecoveredGroups,
  setRecoveryError,
} from '../recoveryDataSlice';

const downloadConnection = async ({
  dataId,
  channelApi,
  aesKey,
  channelId,
}: {
  dataId: string;
  channelApi: ChannelAPI;
  aesKey: string;
  channelId: string;
}): Promise<SyncConnection> => {
  try {
    console.log(channelId, dataId);
    const { data: encrypted } = await channelApi.download({
      channelId,
      dataId,
      deleteAfterDownload: true,
    });
    const connectionData = decryptData(encrypted, aesKey) as SyncConnection;

    // missing data
    if (!connectionData || !connectionData?.id || !connectionData?.name) {
      console.log('missing connection data');
      return;
    }
    console.log(
      `Downloaded profile data of ${connectionData.name} (${connectionData?.id})`,
    );

    return connectionData;
  } catch (err) {
    console.error(`downloadConnection: ${err.message}`);
    throw err;
  }
};

export const downloadConnections =
  ({
    channelApi,
    dataIds,
  }: {
    channelApi: ChannelAPI;
    dataIds: Array<string>;
  }) =>
  async (dispatch: AppDispatch, getState) => {
    try {
      const {
        keypair: { publicKey: signingKey },
        recoveryData: {
          id: recoveryId,
          aesKey,
          channel: { channelId },
        },
      } = getState();

      const connections = selectAllConnections(getState());

      const existingConnIds = connections.map((c) => c.id);

      const isConn = (id) => id.startsWith('connection_');
      const connId = (id) => id.replace('connection_', '').split(':')[0];
      const uploader = (id) => id.replace('connection_', '').split(':')[1];

      const connectionDataIds = dataIds.filter(
        (id) =>
          isConn(id) &&
          uploader(id) !== b64ToUrlSafeB64(signingKey) &&
          !existingConnIds.includes(connId(id)) &&
          connId(id) !== recoveryId,
      );

      let count = 0;
      for (const dataId of connectionDataIds) {
        const connectionData = await downloadConnection({
          dataId,
          channelApi,
          aesKey,
          channelId,
        });
        if (connectionData) {
          let filename: string;
          if (connectionData.photo) {
            filename = await saveImage({
              imageName: connectionData.id,
              base64Image: connectionData.photo,
            });
          }
          const newConnection: Connection = {
            ...connectionData,
            photo: { filename },
          };

          dispatch(addConnection(newConnection));
          count++;
        }
      }
      if (count > 0) {
        dispatch(increaseRecoveredConnections(count));
      }
      return connectionDataIds.length;
    } catch (err) {
      console.error(`downloadingConnections: ${err.message}`);
    }
  };

export const downloadNamePhoto =
  ({
    channelApi,
    dataIds,
  }: {
    channelApi: ChannelAPI;
    dataIds: Array<string>;
  }) =>
  async (dispatch: AppDispatch, getState) => {
    const {
      keypair: { publicKey: signingKey },
      recoveryData: {
        id: recoveryId,
        aesKey,
        channel: { channelId },
      },
    } = getState();

    const connId = (id) => id.replace('connection_', '').split(':')[0];
    const uploader = (id) => id.replace('connection_', '').split(':')[1];

    const dataId = dataIds.find(
      (id) =>
        connId(id) === recoveryId &&
        uploader(id) !== b64ToUrlSafeB64(signingKey),
    );

    if (dataId) {
      const connectionData = await downloadConnection({
        dataId,
        channelApi,
        aesKey,
        channelId,
      });

      const {
        recoveryData: { name },
      } = getState();

      if (!name && connectionData) {
        let filename: string;
        if (connectionData.photo) {
          filename = await saveImage({
            imageName: connectionData.id,
            base64Image: connectionData.photo,
          });
        }
        dispatch(
          updateNamePhoto({ name: connectionData.name, photo: { filename } }),
        );
      }
    }
  };

const downloadGroup = async ({
  dataId,
  channelApi,
  aesKey,
  channelId,
}: {
  dataId: string;
  channelApi: ChannelAPI;
  aesKey: string;
  channelId: string;
}) => {
  try {
    const { data: encrypted } = await channelApi.download({
      channelId,
      dataId,
      deleteAfterDownload: true,
    });
    const groupData = decryptData(encrypted, aesKey);
    // group data missing
    if (!groupData || !groupData?.id || !groupData?.aesKey) {
      console.log('missing group data');
      return;
    }

    let filename;
    if (groupData.photo) {
      filename = await saveImage({
        imageName: groupData.id,
        base64Image: groupData.photo,
      });
    }
    groupData.photo = { filename };
    return groupData;
  } catch (err) {
    console.error(`downloadGroup: ${err.message}`);
  }
};

export const downloadGroups =
  ({
    channelApi,
    dataIds,
  }: {
    channelApi: ChannelAPI;
    dataIds: Array<string>;
  }) =>
  async (dispatch: AppDispatch, getState) => {
    try {
      const {
        keypair: { publicKey: signingKey },
        recoveryData: {
          aesKey,
          channel: { channelId },
        },
      } = getState();

      const isGroup = (id) => id.startsWith('group_');
      const uploader = (id) => id.replace('group_', '').split(':')[1];
      const groupDataIds = dataIds.filter(
        (id) => isGroup(id) && uploader(id) !== b64ToUrlSafeB64(signingKey),
      );
      let count = 0;
      for (const dataId of groupDataIds) {
        const groupData = await downloadGroup({
          dataId,
          channelApi,
          aesKey,
          channelId,
        });
        if (groupData) {
          dispatch(upsertGroup(groupData));
          count++;
        }
      }
      if (count > 0) {
        dispatch(increaseRecoveredGroups(count));
      }
      return groupDataIds.length;
    } catch (err) {
      console.error(`downloadingGroups: ${err.message}`);
    }
  };

export const downloadSigs =
  ({
    channelApi,
    dataIds,
  }: {
    channelApi: ChannelAPI;
    dataIds: Array<string>;
  }) =>
  async (dispatch: AppDispatch, getState) => {
    try {
      const {
        recoveryData: {
          sigs,
          channel: { channelId },
          id,
        },
      } = getState();

      const isSig = (id: string) => id.startsWith('sig_');
      const sigId = (id: string) => id.replace('sig_', '').split(':')[0];

      const sigDataIds = dataIds.filter(
        (dataId) => isSig(dataId) && !sigs[sigId(dataId)],
      );

      for (const dataId of sigDataIds) {
        const signer = sigId(dataId);
        const { data: sig }: { data: Signature } = await channelApi.download({
          channelId,
          dataId,
        });
        if (id && sig.id !== id) {
          // recovery connections disagree on which account is being recovered!
          throw new RecoveryError(RecoveryErrorType.MISMATCH_ID);
        }
        dispatch(setSig({ signer, sig }));
      }
      return sigDataIds.length;
    } catch (err) {
      if (err instanceof RecoveryError) {
        console.error(`downloadingSigs: ${err.errorType}`);
        dispatch(setRecoveryError({ errorType: err.errorType }));
      } else {
        console.error(`downloadingSigs: ${err.message}`);
        dispatch(
          setRecoveryError({
            errorType: RecoveryErrorType.GENERIC,
            errorMessage: err.message,
          }),
        );
      }
    }
  };
