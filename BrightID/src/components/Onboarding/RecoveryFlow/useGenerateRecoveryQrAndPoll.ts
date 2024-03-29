import { useEffect, useState } from 'react';
import qrcode from 'qrcode';
import { parseString } from 'xml2js';
import { useDispatch, useSelector } from '@/store/hooks';
import { userSelector } from '@/reducer/userSlice';
import {
  selectRecoveryStep,
  setRecoverStep,
  uploadCompletedByOtherSide,
} from '@/components/Onboarding/RecoveryFlow/recoveryDataSlice';
import { recover_steps } from '@/utils/constants';
import {
  createRecoveryChannel,
  pollRecoveryChannel,
} from '@/components/Onboarding/RecoveryFlow/thunks/channelThunks';
import { setupRecovery } from '@/components/Onboarding/RecoveryFlow/thunks/recoveryThunks';
import {
  createSyncChannel,
  pollImportChannel,
  setupSync,
} from '@/components/Onboarding/ImportFlow/thunks/channelThunks';
import { buildRecoveryChannelQrUrl } from '@/utils/recovery';

export function useGenerateRecoveryQrAndPoll({
  action,
  urlType,
}: {
  action: string;
  urlType: string;
}) {
  const [qrUrl, setQrUrl] = useState<URL>();
  const [qrsvg, setQrsvg] = useState('');
  const [alreadyNotified, setAlreadyNotified] = useState(false);
  const recoveryData = useSelector((state) => state.recoveryData);
  const { id } = useSelector(userSelector);
  const isScanned = useSelector(
    (state) =>
      uploadCompletedByOtherSide(state) ||
      state.recoveryData.recoveredConnections ||
      state.recoveryData.recoveredGroups ||
      state.recoveryData.recoveredBlindSigs,
  );
  const dispatch = useDispatch();
  const step = useSelector(selectRecoveryStep);

  const sigCount = recoveryData.sigs
    ? Object.values(recoveryData.sigs).length
    : 0;

  // start polling recovery channel to get sig and mutual info
  useEffect(() => {
    if (
      action === 'recovery' &&
      recoveryData.recoverStep === recover_steps.POLLING_SIGS &&
      !recoveryData.channel.pollTimerId
    ) {
      dispatch(pollRecoveryChannel());
    }
  }, [
    action,
    dispatch,
    recoveryData.channel.pollTimerId,
    recoveryData.recoverStep,
  ]);

  // create recovery data and start polling channel
  useEffect(() => {
    const runRecoveryEffect = async () => {
      // create publicKey, secretKey, aesKey for user
      await dispatch(setupRecovery());
      // create channel and upload new publicKey to get signed by the scanner
      await dispatch(createRecoveryChannel());
      dispatch(setRecoverStep(recover_steps.POLLING_SIGS));
    };
    const runImportEffect = async () => {
      // create publicKey, secretKey, aesKey for user
      await dispatch(setupRecovery());
      // create channel and upload new publicKey to be added as a new signing key by the scanner
      await dispatch(createRecoveryChannel());
      // start polling channel to get connections/groups/blindsigs info
      dispatch(pollImportChannel());
    };
    const runSyncEffect = async () => {
      // create a new aesKey
      await dispatch(setupSync());
      // create channel and upload lastSyncTime to the channel if it is not primary device
      // or poll lastSyncTime from other side if it is and then upload connections/groups/blindsigs
      // added after lastSyncTime to the channel
      await dispatch(createSyncChannel());
      // start polling channel to get new connections/groups/blindsigs info
      dispatch(pollImportChannel());
    };

    if (step === recover_steps.NOT_STARTED) {
      if (action === 'recovery') {
        if (!id) {
          console.log(`initializing recovery process`);
          runRecoveryEffect();
        } else {
          console.log(`Not starting recovery process, user has id!`);
        }
      } else if (action === 'import') {
        console.log(`initializing import process`);
        runImportEffect();
      } else if (action === 'sync') {
        console.log(`initializing sync process`);
        runSyncEffect();
      }
    }
  }, [action, dispatch, id, step]);

  const [changePrimaryDevice, setChangePrimaryDevice] = useState(true);
  // set QRCode and SVG
  useEffect(() => {
    if (recoveryData.channel.url && recoveryData.aesKey) {
      const newQrUrl = buildRecoveryChannelQrUrl({
        aesKey: recoveryData.aesKey,
        url: recoveryData.channel.url,
        t: urlType,
        changePrimaryDevice,
      });
      console.log(`new qrCode url: ${newQrUrl.href}`);
      setQrUrl(newQrUrl);

      const parseQrString = (err, qrsvg) => {
        if (err) return console.log(err);
        setQrsvg(qrsvg);
      };

      qrcode.toString(newQrUrl.href, (err, qr) => {
        if (err) return console.log(err);
        parseString(qr, parseQrString);
      });
    }
  }, [
    changePrimaryDevice,
    recoveryData.aesKey,
    recoveryData.channel.url,
    urlType,
  ]);

  return {
    isScanned,
    qrUrl,
    qrsvg,
    sigCount,
    changePrimaryDevice,
    setChangePrimaryDevice,
    recoveryData,
    alreadyNotified,
    setAlreadyNotified,
  };
}
