import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  InteractionManager,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from '@/store/hooks';
import { fontSize } from '@/theme/fonts';
import { WHITE, PRIMARY, BLACK, SUCCESS, GRAY1 } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { backupAppData } from '@/components/Onboarding/RecoveryFlow/thunks/backupThunks';
import { setBackupCompleted } from '@/reducer/userSlice';
import DetoxEnabled from '@/utils/Detox';
import { saveId } from './thunks';
import Congratulations from '../../Icons/Congratulations';
import LinearLeftToRightArrow from '@/components/Icons/LinearArrowLeftToRight';

/* Onboarding Success Screen */

/* ======================================== */

export const SuccessScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const password = useSelector((state) => state.user.password);

  const continueOnPress = () => {
    // this  will cause navigation to HomeScreen
    dispatch(saveId());
    if (password) {
      console.log(`Starting initial backup`);
      dispatch(backupAppData()).then(() => {
        dispatch(setBackupCompleted(true));
      });
    }
    return () => {
      // navigate to view password walkthrough
      if (!DetoxEnabled) {
        InteractionManager.runAfterInteractions(() => {
          navigation.navigate('ViewPasswordWalkthrough' as never);
        });
      }
    };
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={GRAY1}
          animated={true}
        />

        <Image
          source={require('@/static/brightid-final.png')}
          accessible={true}
          accessibilityLabel="Home Header Logo"
          resizeMode="contain"
          style={styles.logo}
        />

        <View>
          <View style={styles.imageContainer}>
            <View style={styles.phoneContainer}>
              <Image
                source={require('@/static/brightid-phone.png')}
                accessible={true}
                accessibilityLabel="Home Header Logo"
                resizeMode="contain"
                style={styles.phone}
              />
            </View>
            <Congratulations width={190} height={230} />
          </View>
        </View>

        <View>
          {/* todo the texts should be modified in locales and here */}
          <Text style={styles.congratText}>
            {t('onboarding.text.congratulations1')}
          </Text>
          <Text style={styles.registerText}>
            {t('onboarding.text.congratulations2')}
          </Text>
        </View>

        {/* todo add continue to locales and be used from there in the button */}
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={continueOnPress}
          accessibilityLabel={t('onboarding.button.create')}
          testID="confirmCreateBtn"
        >
          <Text style={styles.continueBtnText}>Continue</Text>
          <LinearLeftToRightArrow color={WHITE} />
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    zIndex: 2,
    overflow: 'hidden',
    justifyContent: 'space-evenly',
  },
  logo: {
    maxWidth: '40%',
    maxHeight: 90,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 190,
    height: 230,
  },
  phoneContainer: {
    position: 'absolute',
    top: 25,
    left: 25,
  },
  phone: {
    width: 140,
    height: 180,
  },
  congratText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    textAlign: 'center',
    lineHeight: 26,
    color: SUCCESS,
    marginBottom: 4,
  },
  registerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    textAlign: 'center',
    lineHeight: 26,
    color: '#424242',
  },
  continueBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '89%',
    height: '6.5%',
    backgroundColor: PRIMARY,
    borderRadius: 16,
    flexDirection: 'row',
  },
  continueBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: WHITE,
    marginRight: 12,
  },
});

export default SuccessScreen;
