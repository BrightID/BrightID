import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector, useDispatch } from '@/store';
import { useNavigation } from '@react-navigation/native';
import { BLACK, DARKER_GREY, GREEN, ORANGE } from '@/theme/colors';
import { useTranslation } from 'react-i18next';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import {
  finishRecovery,
  setRecoveryKeys,
} from '@/components/Onboarding/RecoveryFlow/thunks/recoveryThunks';
import Spinner from 'react-native-spinkit';

/* Component to track import restore */

const ImportScreen = () => {
  const recoveryData = useSelector((state: State) => state.recoveryData);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const setup = async () => {
      console.log('hereeeeeeeee');
      await dispatch(setRecoveryKeys());
      await dispatch(finishRecovery());
      // navigation.navigate('Home');
    }
    console.log(recoveryData?.uploadCompletedBy, recoveryData?.id);
    if (recoveryData && recoveryData.uploadCompletedBy[recoveryData.id]) {
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