import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from '@/store';
import { useFocusEffect } from '@react-navigation/native';
import { BLACK, ORANGE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { setBackupCompleted, setPassword } from '@/reducer/userSlice';
import { RecoverAccount } from '@/components/Onboarding/RecoveryFlow/RecoverAccount';
import { RestoreBackup } from '@/components/Onboarding/RecoveryFlow/RestoreBackup';
import {
  finishRecovery,
  recoverAccount,
  recoverData,
} from './thunks/recoveryThunks';
import { CHANNEL_POLL_INTERVAL, clearChannel } from './thunks/channelThunks';

// clear channel after this time
const channelTimeout = CHANNEL_POLL_INTERVAL * 3.1;

export enum AccountSteps {
  INITIAL,
  WAITING_DOWNLOAD,
  DOWNLOAD_COMPLETE,
  RECOVERING_ACCOUNT,
  ERROR,
  COMPLETE,
}

export enum BackupSteps {
  INITIAL,
  WAITING_ACCOUNT,
  WAITING_PASSWORD,
  RESTORING_DATA,
  ERROR,
  SKIPPED,
  COMPLETE,
}

const RestoreScreen = () => {
  const [pass, setPass] = useState('');
  const recoveredConnections = useSelector(
    (state) => state.recoveryData.recoveredConnections,
  );
  const recoveredGroups = useSelector(
    (state) => state.recoveryData.recoveredGroups,
  );
  const [accountStep, setAccountStep] = useState<AccountSteps>(
    AccountSteps.WAITING_DOWNLOAD,
  );
  const [dataStep, setDataStep] = useState<BackupSteps>(
    BackupSteps.WAITING_ACCOUNT,
  );
  const [accountError, setAccountError] = useState('');
  const [timer, setTimer] = useState(Math.ceil(channelTimeout / 1000));
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      // disable buttons until 3 passes of the the poll channel to make sure all data is downloaded
      const t = setTimeout(() => {
        clearChannel();
        setAccountStep(AccountSteps.DOWNLOAD_COMPLETE);
      }, channelTimeout);

      // display to user how long they are waiting for the button to be displayed
      const i = setInterval(() => {
        setTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
      return () => {
        clearTimeout(t);
        clearInterval(i);
      };
    }, []),
  );

  // track account recovery state
  useEffect(() => {
    const runEffect = async () => {
      try {
        console.log(`Starting account recovery`);
        await dispatch(recoverAccount());
        console.log(`Successfully recovered account`);
        setAccountStep(AccountSteps.COMPLETE);
        // restore backup can now start
        setDataStep(BackupSteps.WAITING_PASSWORD);
      } catch (e) {
        console.log(`Error during account recovery: ${e.message}`);
        setAccountStep(AccountSteps.ERROR);
        setAccountError(e.message);
      }
    };
    switch (accountStep) {
      case AccountSteps.DOWNLOAD_COMPLETE:
        runEffect();
        break;
      default:
        break;
    }
  }, [dispatch, accountStep]);

  // track data recovery state
  useEffect(() => {
    switch (dataStep) {
      case BackupSteps.COMPLETE:
        // save password in state and set backupCompleted marker
        dispatch(setPassword(pass));
        dispatch(setBackupCompleted(true));
        break;
      default:
        break;
    }
  }, [dataStep, dispatch, pass]);

  // track overall progress
  useEffect(() => {
    if (
      accountStep === AccountSteps.COMPLETE &&
      (dataStep === BackupSteps.COMPLETE || dataStep === BackupSteps.SKIPPED)
    ) {
      console.log(`Recovery process finished!`);
      dispatch(finishRecovery());
    }
  }, [accountStep, dataStep, dispatch]);

  const skip = () => {
    setPass('');
    setDataStep(BackupSteps.SKIPPED);
  };

  const restoreBackup = async () => {
    try {
      console.log(`Starting restore backup`);
      setDataStep(BackupSteps.RESTORING_DATA);
      await dispatch(recoverData(pass));
      console.log(`Successfully restored backup`);
      setDataStep(BackupSteps.COMPLETE);
    } catch (e) {
      console.log(`Error during recover: ${e.message}`);
      setDataStep(BackupSteps.ERROR);
    }
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <KeyboardAvoidingView style={styles.container} behavior="position">
        <View style={styles.recoverAccountContainer}>
          <RecoverAccount
            currentStep={accountStep}
            recoveredGroups={recoveredGroups}
            recoveredConnections={recoveredConnections}
            errorMessage={accountError}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.restoreBackupContainer}>
          <RestoreBackup
            currentStep={dataStep}
            doRestore={restoreBackup}
            doSkip={skip}
            password={pass}
            setPassword={setPass}
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  divider: {
    paddingTop: 40,
    marginBottom: 30,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: BLACK,
  },
  recoverAccountContainer: {
    marginTop: 20,
    minHeight: '25%',
  },
  restoreBackupContainer: {
    height: '50%',
  },
});

export default RestoreScreen;
