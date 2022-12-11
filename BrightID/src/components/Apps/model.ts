import store from '@/store';
import { selectAllSigs } from '@/reducer/appsSlice';
import BrightidError, { APP_ID_NOT_FOUND } from '@/api/brightidError';
import { NodeApi } from '@/api/brightId';

export const getSignedTimestamp = (app: AppInfo) => {
  const sigs = selectAllSigs(store.getState());
  const vel = app.verificationExpirationLength;
  const roundedTimestamp = vel ? Math.floor(Date.now() / vel) * vel : 0;
  for (const verification of app.verifications) {
    const sigInfo = sigs.find(
      (sig) =>
        sig.app === app.id &&
        sig.verification === verification &&
        sig.roundedTimestamp === roundedTimestamp,
    );
    if (sigInfo && sigInfo.sig) {
      return sigInfo.signedTimestamp;
    }
  }
  return null;
};

export const getSponsorship = async (
  appUserId: string,
  api: NodeApi,
): Promise<SponsorshipInfo | undefined> => {
  try {
    return await api.getSponsorship(appUserId);
  } catch (e) {
    if (e instanceof BrightidError && e.errorNum === APP_ID_NOT_FOUND) {
      // node has not yet registered the sponsor request -> Ignore
      console.log(`sponsor request for ${appUserId} not yet existing`);
    } else {
      throw e;
    }
  }
};
