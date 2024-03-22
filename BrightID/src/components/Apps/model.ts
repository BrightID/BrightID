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

// Create promise that polls on sigsUpdating state and resolves once it is false.
export const waitForBlindSigsUpdate = (getState) => {
  return new Promise<void>((resolve, reject) => {
    const waitingStartTime = Date.now();
    const intervalId = setInterval(() => {
      const timeElapsed = Date.now() - waitingStartTime;
      const stillUpdating = selectSigsUpdating(getState());
      if (!stillUpdating) {
        console.log(`blindSigs update finished`);
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
