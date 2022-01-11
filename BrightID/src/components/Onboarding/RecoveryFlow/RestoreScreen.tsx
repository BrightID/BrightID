import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '@/store';
import { BLACK, ORANGE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { setBackupCompleted, setPassword } from '@/reducer/userSlice';
import { RecoverAccount } from '@/components/Onboarding/RecoveryFlow/RecoverAccount';
import { RestoreBackup } from '@/components/Onboarding/RecoveryFlow/RestoreBackup';
import { NodeApiContext } from '@/components/NodeApiGate';
import {
  finishRecovery,
  recoverData,
  setRecoveryKeys,
  socialRecovery,
} from './thunks/recoveryThunks';
import { CHANNEL_POLL_INTERVAL, clearChannel } from './thunks/channelThunks';

// clear channel after this time
const channelTimeout = CHANNEL_POLL_INTERVAL * 3.1;

// max time to wait for operation being applied
const applyTimeout = 1000 * 60; // 1 minute

export enum AccountSteps {
  WAITING_DOWNLOAD,
  DOWNLOAD_COMPLETE,
  WAITING_OPERATION, // op submitted to backend but not yet applied
  OPERATION_APPLIED, // op successfully applied in backend
  ERROR,
  COMPLETE,
}

export enum BackupSteps {
  WAITING_ACCOUNT, // Waiting for account recovery to complete
  WAITING_PASSWORD, // Ready to start, waiting for user to provide password
  RESTORING_DATA, // Restoring in progress
  SKIPPED, // User decided to skip backup restoration
  ERROR,
  COMPLETE,
}

const RestoreScreen = () => {
  const { t } = useTranslation();
  const [pass, setPass] = useState('');
  const api = useContext(NodeApiContext);
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
  const [recoveryOpHash, setRecoveryOpHash] = useState('');
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      // wait 3 passes of the the poll channel to make sure all data is downloaded
      const t = setTimeout(() => {
        clearChannel();
        setAccountStep(AccountSteps.DOWNLOAD_COMPLETE);
      }, channelTimeout);

      return () => {
        clearTimeout(t);
      };
    }, []),
  );

  // track account recovery state
  useEffect(() => {
    const startRecovery = async () => {
      try {
        console.log(`Starting account recovery`);
        const opHash = await dispatch(socialRecovery(api));
        console.log(`Recover op Hash: ${opHash}`);
        setRecoveryOpHash(opHash);
        setAccountStep(AccountSteps.WAITING_OPERATION);
      } catch (err) {
        let errorString = '';
        if (err instanceof Error) {
          errorString = `${err.message}`;
        } else {
          errorString = `${err}`;
        }
        console.log(`Error during account recovery: ${errorString}`);
        setAccountStep(AccountSteps.ERROR);
        setAccountError(errorString);
      }
    };
    const finishRecovery = async () => {
      dispatch(setRecoveryKeys());
      setAccountStep(AccountSteps.COMPLETE);
      // restore backup can now start
      setDataStep(BackupSteps.WAITING_PASSWORD);
    };
    switch (accountStep) {
      case AccountSteps.DOWNLOAD_COMPLETE:
        startRecovery();
        break;
      case AccountSteps.OPERATION_APPLIED:
        finishRecovery();
        break;
      default:
        break;
    }
  }, [dispatch, accountStep, api]);

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
      Alert.alert(
        t('common.alert.info'),
        t('restore.alert.text.restoreSuccess'),
        [{ text: t('common.alert.ok') }],
      );
      dispatch(finishRecovery());
    }
  }, [accountStep, dataStep, dispatch, t]);

  // Poll for recovery operation state
  useEffect(() => {
    if (
      recoveryOpHash !== '' &&
      accountStep === AccountSteps.WAITING_OPERATION
    ) {
      const startTime = Date.now();
      const timerId = setInterval(async () => {
        const timeElapsed = Date.now() - startTime;
        if (timeElapsed > applyTimeout) {
          // operation did not get applied within time window. Abort and show error.
          setAccountStep(AccountSteps.ERROR);
          setAccountError('Operation timed out');
          setRecoveryOpHash('');
        } else {
          const { state } = await api.getOperationState(recoveryOpHash);
          console.log(`recover Op state: ${state}`);
          switch (state) {
            case 'unknown':
            case 'init':
            case 'sent':
              // op being processed. do nothing.
              break;
            case 'applied':
              setAccountStep(AccountSteps.OPERATION_APPLIED);
              setRecoveryOpHash('');
              break;
            case 'failed':
              setAccountStep(AccountSteps.ERROR);
              setAccountError('Operation could not be applied');
              setRecoveryOpHash('');
              break;
            default:
              setAccountStep(AccountSteps.ERROR);
              setAccountError('Unhandled operation state');
              setRecoveryOpHash('');
          }
        }
      }, 5000);
      console.log(`Start polling recoveryOp timer ${timerId}`);

      return () => {
        console.log(`Stop polling recoveryOp timer ${timerId}`);
        clearInterval(timerId);
      };
    }
  }, [accountStep, api, recoveryOpHash]);

  const skip = () => {
    setPass('');
    setDataStep(BackupSteps.SKIPPED);
  };

  const restoreBackup = async () => {
    try {
      console.log(`Starting restore backup`);
      setDataStep(BackupSteps.RESTORING_DATA);
      await dispatch(recoverData(pass, api));
      console.log(`Successfully restored backup`);
      setDataStep(BackupSteps.COMPLETE);
    } catch (err) {
      let errorString = '';
      if (err instanceof Error) {
        errorString = `${err.name} - ${err.message}`;
      } else {
        errorString = `${err}`;
      }
      console.log(`Error during recover: ${errorString}`);
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
    marginTop: DEVICE_LARGE ? 40 : 20,
    marginBottom: DEVICE_LARGE ? 30 : 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: BLACK,
  },
  recoverAccountContainer: {
    marginTop: DEVICE_LARGE ? 25 : 20,
    minHeight: '25%',
  },
  restoreBackupContainer: {
    height: '50%',
  },
});

export default RestoreScreen;
