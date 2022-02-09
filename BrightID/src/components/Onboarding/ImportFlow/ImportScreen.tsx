import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { setUserId, setPrimaryDevice } from '@/actions';
import { useSelector, useDispatch } from '@/store';
import Spinner from 'react-native-spinkit';
import { useNavigation } from '@react-navigation/native';
import { BLACK, DARKER_GREY, GREEN, ORANGE } from '@/theme/colors';
import { useTranslation } from 'react-i18next';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { setRecoveryKeys } from '../RecoveryFlow/thunks/recoveryThunks';
import { resetRecoveryData, uploadCompletedByOtherSide } from '../RecoveryFlow/recoveryDataSlice';
import { clearImportChannel } from './thunks/channelThunks';


/* Component to track import restore */

const ImportScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const recoveryData = useSelector((state: State) => state.recoveryData);
  const importCompleted = useSelector((state) => uploadCompletedByOtherSide(state));

  useEffect(() => {
    const setup = async () => {
      clearImportChannel();
      await dispatch(setPrimaryDevice(false));
      await dispatch(setRecoveryKeys());
      await dispatch(resetRecoveryData());
      await dispatch(setUserId(recoveryData.id));
      // navigation.navigate('Home');
    }

    if (importCompleted) {
       setup();
    }
    
  }, [t, recoveryData, dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.waitingContainer}>
        <Text style={styles.infoText}>
          {t('import.text.waitImporting')}
        </Text>
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