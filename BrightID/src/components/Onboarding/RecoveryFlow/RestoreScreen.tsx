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
import {
  CHANNEL_POLL_INTERVAL,
  clearRecoveryChannel,
} from './thunks/channelThunks';
import { selectOperationByHash } from '@/reducer/operationsSlice';
import { operation_states } from '@/utils/constants';

// clear channel after this time
const channelTimeout = CHANNEL_POLL_INTERVAL * 3.1;

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
  const recoveryOp = useSelector((state) =>
    selectOperationByHash(state, recoveryOpHash),
  );
  const [currentItem, setCurrentItem] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      // wait 3 passes of the the poll channel to make sure all data is downloaded
      const t = setTimeout(() => {
        clearRecoveryChannel();
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
        setAccountStep(AccountSteps.WAITING_OPERATION);
        console.log(`Starting account recovery`);
        const op = await dispatch(socialRecovery(api));
        if (op === 'ALREADY APPLIED') {
          // we can shortcut to the next step without waiting for operation status
          setAccountStep(AccountSteps.OPERATION_APPLIED);
        } else {
          console.log(`Recover op Hash: ${op.hash}`);
          setRecoveryOpHash(op.hash);
        }
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

  useEffect(() => {
    if (recoveryOp && accountStep === AccountSteps.WAITING_OPERATION) {
      console.log(`recover Op state: ${recoveryOp.state}`);
      switch (recoveryOp.state) {
        case operation_states.UNKNOWN:
        case operation_states.INIT:
        case operation_states.SENT:
          // op being processed. do nothing.
          break;
        case operation_states.APPLIED:
          setAccountStep(AccountSteps.OPERATION_APPLIED);
          setRecoveryOpHash('');
          break;
        case operation_states.FAILED:
          setAccountStep(AccountSteps.ERROR);
          setAccountError('Operation could not be applied');
          setRecoveryOpHash('');
          break;
        case operation_states.EXPIRED:
          // operation did not get applied within time window. Abort and show error.
          setAccountStep(AccountSteps.ERROR);
          setAccountError('Operation timed out');
          setRecoveryOpHash('');
          break;
        default:
          setAccountStep(AccountSteps.ERROR);
          setAccountError('Unhandled operation state');
          setRecoveryOpHash('');
      }
    }
  }, [recoveryOp, accountStep]);

  const skip = () => {
    setPass('');
    setDataStep(BackupSteps.SKIPPED);
  };

  const restoreBackup = async () => {
    try {
      console.log(`Starting restore backup`);
      setDataStep(BackupSteps.RESTORING_DATA);
      await dispatch(recoverData(pass, api, setTotalItems, setCurrentItem));
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
            totalItems={totalItems}
            currentItem={currentItem}
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
