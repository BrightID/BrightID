// @flow

import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fontSize } from '@/theme/fonts';
import { WHITE, BLACK, DARKER_GREY, ORANGE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';

/* Description */
/* ======================================== */

/**
 * Initial Onboarding screen of BrightID
 */

/* Onboarding Screen */
/* ======================================== */

export const PasswordScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    // dispatch(setName(displayName));
    navigation.navigate('OnboardSuccess');
  };

  const disabled = !password || !confirmPassword;
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container}>
        <View style={styles.descContainer}>
          <Text style={styles.registerText}>
            {t('signup.text.createPassword')}
          </Text>
        </View>
        <View style={styles.midContainer}>
          <TextInput
            autoCompleteType="password"
            autoCorrect={false}
            secureTextEntry={true}
            style={styles.textInput}
            textContentType="password"
            underlineColorAndroid="transparent"
            testID="password"
            onChangeText={setPassword}
            value={password}
            placeholder={t('signup.placeholder.password')}
            placeholderTextColor={DARKER_GREY}
            blurOnSubmit={true}
          />
          <TextInput
            autoCompleteType="password"
            autoCorrect={false}
            secureTextEntry={true}
            style={styles.textInput}
            textContentType="password"
            underlineColorAndroid="transparent"
            testID="confirmPassword"
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            placeholder={t('signup.placeholder.confirmPassword')}
            placeholderTextColor={DARKER_GREY}
            blurOnSubmit={true}
          />
          <Text style={styles.privacyText}>
            {t('signup.text.passwordInfo')}
          </Text>
        </View>
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitBtn, { opacity: disabled ? 0.7 : 1 }]}
            onPress={handleSubmit}
            accessibilityLabel={t('signup.button.submit')}
            disabled={disabled}
          >
            <Text style={styles.submitBtnText}>
              {t('signup.button.submit')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSubmit}
            accessibilityLabel={t('signup.button.skip')}
          >
            <Text style={styles.skipBtnText}>{t('signup.button.skip')}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    borderTopLeftRadius: 58,
    marginTop: -58,
    overflow: 'hidden',
    zIndex: 2,
  },
  descContainer: {
    marginTop: DEVICE_LARGE ? 100 : 85,
  },
  midContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  registerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    lineHeight: DEVICE_LARGE ? 26 : 24,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    color: BLACK,
    borderBottomWidth: 1,
    borderBottomColor: DARKER_GREY,
    width: '60%',
    textAlign: 'center',
    paddingBottom: 10,
  },
  privacyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[11],
    color: DARKER_GREY,
    textAlign: 'center',
    width: '72%',
  },
  submitContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DEVICE_LARGE ? 85 : 70,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 160 : 140,
    height: DEVICE_LARGE ? 50 : 45,
    backgroundColor: ORANGE,
    borderRadius: 100,
    elevation: 1,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  submitBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: WHITE,
  },
  skipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 160 : 140,
    height: DEVICE_LARGE ? 50 : 45,
    backgroundColor: WHITE,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: ORANGE,
    marginLeft: 12,
  },
  skipBtnText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[16],
    color: ORANGE,
  },
});

export default PasswordScreen;
