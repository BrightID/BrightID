
export const buildRecoveryChannelQrUrl = ({ aesKey, url, t }: RecoveryChannel) => {
  const qrUrl = new URL(url.href);
  qrUrl.searchParams.append('aes', aesKey);
  qrUrl.searchParams.append('t', t);
  return qrUrl;
};
