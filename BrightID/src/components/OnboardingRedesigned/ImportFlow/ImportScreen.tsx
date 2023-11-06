import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { setUserId, setPrimaryDevice } from '@/actions';
import { useSelector, useDispatch } from '@/store/hooks';
import { BLACK, ORANGE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { setRecoveryKeys } from '../RecoveryFlow/thunks/recoveryThunks';
import {
  resetRecoveryData,
  setRecoveryError,
  uploadCompletedByOtherSide,
} from '../RecoveryFlow/recoveryDataSlice';
import { clearImportChannel } from './thunks/channelThunks';
import { RecoveryErrorType } from '@/components/Onboarding/RecoveryFlow/RecoveryError';

/* Component to track import restore */
const ImportScreen = ({ route }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const recoveryData = useSelector((state) => state.recoveryData);
  const importCompleted = useSelector(uploadCompletedByOtherSide);

  useEffect(() => {
    if (importCompleted) {
      clearImportChannel();
      try {
        dispatch(setRecoveryKeys());
        dispatch(setPrimaryDevice(!!route.params.changePrimaryDevice));
        dispatch(resetRecoveryData());
        dispatch(setUserId(recoveryData.id));
      } catch (err) {
        const errorString = err instanceof Error ? err.message : `${err}`;
        dispatch(
          setRecoveryError({
            errorType: RecoveryErrorType.GENERIC,
            errorMessage: errorString,
          }),
        );
      }
    }
  }, [recoveryData, dispatch, importCompleted]);

  return (
    <View style={styles.container}>
      <View style={styles.waitingContainer}>
        <Text style={styles.infoText}>{t('import.text.waitImporting')}</Text>
        <Spinner
          isVisible={true}
          size={DEVICE_LARGE ? 64 : 44}
          type="Wave"
          color={ORANGE}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flex: 1,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    color: BLACK,
    fontSize: fontSize[16],
    maxWidth: '90%',
  },
});

export default ImportScreen;
