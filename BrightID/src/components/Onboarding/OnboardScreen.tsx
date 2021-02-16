import React from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fontSize } from '@/theme/fonts';
import { WHITE, BLACK, GREEN, ORANGE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { createKeypair } from './SignUpFlow/thunks';
import VerifiedBadge from '../Icons/VerifiedBadge';

/* Description */

/* ======================================== */

/**
 * Initial Onboarding screen of BrightID
 * Creates Keypair after pressing `Create My BrightID`
 */

/* Onboarding Screen */

/* ======================================== */
export const Onboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleCreateMyBrightID = () => {
    dispatch(createKeypair())
      .then(() => {
        navigation.navigate('SignupName');
      })
      .catch((err) => {
        Alert.alert(err.message);
      });
  };

  return (
    <>
      <SafeAreaView style={styles.container} testID="OnboardScreen">
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
          <Image
            source={require('@/static/brightid-phone.png')}
            accessible={true}
            accessibilityLabel="Home Header Logo"
            resizeMode="contain"
            style={styles.phone}
          />
          <View style={styles.verifiedBadge}>
            <VerifiedBadge
              width={DEVICE_LARGE ? 65 : 60}
              height={DEVICE_LARGE ? 65 : 60}
              strokeWidth={5.5}
              color={GREEN}
            />
          </View>
        </View>
        <Text style={styles.registerText}>{t('onboarding.text.register')}</Text>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleCreateMyBrightID}
            accessibilityLabel={t('onboarding.button.create')}
            testID="createBrightID"
          >
            <Text style={styles.createBtnText}>
              {t('onboarding.button.create')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.recoverBtn}
            onPress={() => {
              navigation.navigate('Restore');
            }}
            accessibilityLabel={t('onboarding.button.recover')}
          >
            <Text style={styles.recoverBtnText}>
              {t('onboarding.button.recover')}
            </Text>
          </TouchableOpacity>
        </View>
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
    // borderWidth: 1,
  },
  logo: {
    maxWidth: '40%',
    maxHeight: 90,
  },
  center: {},
  phone: {
    width: DEVICE_LARGE ? 140 : 130,
    maxHeight: DEVICE_LARGE ? 180 : 165,
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
    marginTop: DEVICE_LARGE ? 20 : 18,
  },
  btnContainer: {
    width: '85%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  createBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: DEVICE_LARGE ? 50 : 45,
    backgroundColor: ORANGE,
    borderRadius: 100,
    elevation: 1,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  createBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: WHITE,
  },
  recoverBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: DEVICE_LARGE ? 50 : 45,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 100,
    marginTop: DEVICE_LARGE ? 14 : 12,
  },
  recoverBtnText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: ORANGE,
  },
});

export default Onboard;
