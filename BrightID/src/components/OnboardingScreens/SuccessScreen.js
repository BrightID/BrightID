// @flow

import React, { useCallback } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { fontSize } from '@/theme/fonts';
import { WHITE, ORANGE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { saveId } from './thunks';
import Congratulations from '../Icons/Congratulations';

/* Onboarding Success Screen */
/* ======================================== */

const TIMEOUT = 1500;

export const SuccessScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  /**
   * After 2 seconds we save the user id, which will automatically navigate to the homepage
   */

  useFocusEffect(
    useCallback(() => {
      let t = setTimeout(() => {
        dispatch(saveId()).catch((err) => {
          Alert.alert(t('common.alert.error'), err.message);
        });
      }, TIMEOUT);
      return () => {
        clearTimeout(t);
      };
    }, [dispatch]),
  );
  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={WHITE}
          animated={true}
        />

        <View style={styles.header}>
          <Image
            source={require('@/static/brightid-final.png')}
            accessible={true}
            accessibilityLabel="Home Header Logo"
            resizeMode="contain"
            style={styles.logo}
          />
        </View>
        <View style={styles.center}>
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
        <Text style={styles.registerText}>
          {t('onboarding.text.congratulations')}
        </Text>
      </SafeAreaView>
      <View style={styles.orangeBottom} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    borderBottomLeftRadius: 58,
    borderBottomRightRadius: 58,
    marginBottom: DEVICE_LARGE ? 35 : 20,
    zIndex: 2,
    overflow: 'hidden',
  },
  orangeBottom: {
    backgroundColor: ORANGE,
    width: '100%',
    height: 100,
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '15%',
  },
  logo: {
    maxWidth: '40%',
    maxHeight: 90,
  },
  center: {
    flex: 1,
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
  verifiedBadge: {
    position: 'absolute',
    right: 10,
    bottom: 5,
  },
  registerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    lineHeight: DEVICE_LARGE ? 26 : 24,
    marginBottom: DEVICE_LARGE ? 50 : 45,
  },
});

export default SuccessScreen;
