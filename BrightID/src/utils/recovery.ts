import ChannelAPI from '@/api/channelService';
import { hash } from '@/utils/encoding';

export const buildRecoveryChannelQrUrl = ({
  aesKey,
  url,
  t,
}: RecoveryChannel) => {
  const qrUrl = new URL(url.href);
  qrUrl.searchParams.append('aes', aesKey);
  qrUrl.searchParams.append('t', t);
  return qrUrl;
};

export const uploadRecoveryData = async (
  recoveryData: RecoveryData,
  channelApi: ChannelAPI,
) => {
  const channelId = hash(recoveryData.aesKey);
  const dataObj = {
    signingKey: recoveryData.publicKey,
    timestamp: recoveryData.timestamp,
  };
  const data = JSON.stringify(dataObj);
  await channelApi.upload({
    channelId,
    data,
    dataId: 'data',
  });
};

export const loadRecoveryData = async (
  channelApi: ChannelAPI,
  aesKey: string,
): Promise<{ signingKey: string; timestamp: number }> => {
  try {
    const dataString = await channelApi.download({
      channelId: hash(aesKey),
      dataId: 'data',
    });
    const data = JSON.parse(dataString);
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
