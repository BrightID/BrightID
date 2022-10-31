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
  uploadCompletedByOtherSide,
} from '../RecoveryFlow/recoveryDataSlice';
import { clearImportChannel } from './thunks/channelThunks';

/* Component to track import restore */
const ImportScreen = ({ route }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const recoveryData = useSelector((state) => state.recoveryData);
  const importCompleted = useSelector(uploadCompletedByOtherSide);

  useEffect(() => {
    if (importCompleted) {
      clearImportChannel();
      dispatch(setPrimaryDevice(!!route.params.changePrimaryDevice));
      dispatch(setRecoveryKeys());
      dispatch(resetRecoveryData());
      dispatch(setUserId(recoveryData.id));
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
