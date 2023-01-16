import BrightidError, { APP_ID_NOT_FOUND } from '@/api/brightidError';
import { NodeApi } from '@/api/brightId';
import { selectSigsUpdating } from '@/reducer/appsSlice';
import { UPDATE_BLIND_SIG_WAIT_TIME } from '@/utils/constants';

export const getSignedTimestamp = (app: AppInfo, sigs: SigInfo[]) => {
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

// Create promise that polls on sigsUpdating state and resolves once it is false.
export const waitForBlindSigsUpdate = (getState) => {
  return new Promise<void>((resolve, reject) => {
    const waitingStartTime = Date.now();
    const intervalId = setInterval(() => {
      const timeElapsed = Date.now() - waitingStartTime;
      const stillUpdating = selectSigsUpdating(getState());
      if (!stillUpdating) {
        console.log(`blindSigs update finished! Continue with linking...`);
        clearInterval(intervalId);
        resolve();
      }
      if (timeElapsed > UPDATE_BLIND_SIG_WAIT_TIME) {
        clearInterval(intervalId);
        reject(new Error(`Timeout waiting for sigsUpdating to finish!`));
      } else {
        console.log(
          `Still waiting for sigsUpdating to finish. Time elapsed: ${timeElapsed}ms`,
        );
      }
    }, 500);
  });
};
