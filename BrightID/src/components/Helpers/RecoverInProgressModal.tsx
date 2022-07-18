import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LIGHT_BLACK, ORANGE, WHITE, BLACK } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { qrCodeURL_types } from '@/utils/constants';
import { resetRecoveryData } from '@/components/Onboarding/RecoveryFlow/recoveryDataSlice';
import { useDispatch } from '@/store/hooks';

const RecoverInProgressModal = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const goBack = () => {
    navigation.goBack();
  };

  const restartRecoveryHandler = () => {
    console.log(`Restarting recovery`);
    dispatch(resetRecoveryData());
    navigation.navigate('Restore', {
      screen: 'RecoveryCode',
      params: {
        urlType: qrCodeURL_types.RECOVERY,
        action: 'recovery',
      },
    });
  };

  const continueRecoveryHandler = () => {
    console.log(`Continue recovery`);
    navigation.navigate('Restore', {
      screen: 'RecoveryCode',
      params: {
        urlType: qrCodeURL_types.RECOVERY,
        action: 'recovery',
      },
    });
  };

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor={BLACK}
      />
      <TouchableWithoutFeedback onPress={goBack}>
        <View style={styles.blurView} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Account recovery already running
          </Text>
          <Text style={styles.infoText}>
            It looks like you already started the recovery process. Click on
            "Continue Recovery" to resume recovery.
          </Text>
        </View>
        <TouchableOpacity
          testID="ContinueRecoveryBtn"
          style={styles.switchNodeButton}
          onPress={continueRecoveryHandler}
        >
          <Text style={styles.switchNodeButtonText}>Continue recovery</Text>
        </TouchableOpacity>
        <View style={styles.resetInfoContainer}>
          <Text style={styles.infoText}>
            If you have problems with the recovery process you can restart it by
            clicking "Restart Recovery".
          </Text>
        </View>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={restartRecoveryHandler}
        >
          <Text style={styles.resetButtonText}>Restart recovery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    width: '90%',
    borderRadius: 25,
    padding: DEVICE_LARGE ? 30 : 25,
  },
  header: {
    marginTop: 5,
    marginBottom: 10,
  },
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[19],
    textAlign: 'center',
    color: LIGHT_BLACK,
  },
  switchNodeButton: {
    width: '90%',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  switchNodeButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
    color: WHITE,
  },
  resetInfoContainer: {
    marginBottom: 3,
    marginTop: 25,
  },
  infoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: LIGHT_BLACK,
  },
  resetButton: {
    width: '70%',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  resetButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: WHITE,
  },
});

export default RecoverInProgressModal;
