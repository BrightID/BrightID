import {
  qrCodeURL_types,
} from '@/utils/constants';

export const buildRecoveryChannelQrUrl = ({ aesKey, url }: RecoveryChannel) => {
  const qrUrl = new URL(url.href);
  qrUrl.searchParams.append('aes', aesKey);
  qrUrl.searchParams.append('t', qrCodeURL_types.RECOVERY);
  return qrUrl;
};
