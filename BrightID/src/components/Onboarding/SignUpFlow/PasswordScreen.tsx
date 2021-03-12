import React, { useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '@/store';
import { useNavigation } from '@react-navigation/native';
import { fontSize } from '@/theme/fonts';
import { WHITE, BLACK, DARKER_GREY, ORANGE, RED } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { setPassword as setUserPassword } from '@/actions';

/* Description */

/* ======================================== */

/**
 * Initial Onboarding screen of BrightID
 */

/* Onboarding Screen */

/* ======================================== */
const PASSWORD_LENGTH = 8;

export const PasswordScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const passwordInput = useRef(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const id = useSelector((state: State) => state.user.id);

  const checkPassword = () =>
    new Promise((res) => {
      if (password.length < PASSWORD_LENGTH) {
        // using array to indicate where to display the message
        setErrors([`Password must be ${PASSWORD_LENGTH} characters`]);
        setPassword('');
        setConfirmPassword('');
        passwordInput.current?.focus();
      } else if (password !== confirmPassword) {
        // using array to indicate where to display the message
        setErrors([null, 'Passwords must match']);
        setPassword('');
        setConfirmPassword('');
        passwordInput.current?.focus();
      } else {
        // all good
        setErrors([]);
        res(true);
      }
    });

  const handleSubmit = () => {
    checkPassword().then(() => {
      dispatch(setUserPassword(password));
      navigation.navigate('OnboardSuccess');
    });
  };

  const handleSkip = () => {
    navigation.navigate('OnboardSuccess');
  };

  const submitDisabled = !password || !confirmPassword;
  const skipDisabled = !!password && !!confirmPassword;
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="PasswordScreen">
        <View style={styles.descContainer}>
          <Text style={styles.registerText}>
            {t('signup.text.createPassword')}
          </Text>
        </View>
        <TextInput
          style={styles.invisibleUsername}
          placeholder="Username"
          textContentType="username"
          autoCompleteType="username"
          autoCorrect={false}
          value={id}
        />
        <View style={styles.midContainer}>
          <View style={styles.passwordContainer}>
            <TextInput
              autoCompleteType="password"
              autoCorrect={false}
              secureTextEntry={true}
              style={styles.textInput}
              textContentType="password" // passwordrules="minlength: 16; required: lower; required: upper; required: digit; required: [-];"
              underlineColorAndroid="transparent"
              testID="password"
              onChangeText={setPassword}
              value={password}
              placeholder={t('signup.placeholder.password')}
              placeholderTextColor={DARKER_GREY}
              blurOnSubmit={true}
              ref={passwordInput}
            />
            {errors[0] ? (
              <Text style={styles.errorText}>{errors[0]}</Text>
            ) : null}
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              autoCompleteType="password"
              autoCorrect={false}
              secureTextEntry={true}
              style={styles.textInput}
              textContentType="password" // passwordrules="minlength: 16; required: lower; required: upper; required: digit; required: [-];"
              underlineColorAndroid="transparent"
              testID="confirmPassword"
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              placeholder={t('signup.placeholder.confirmPassword')}
              placeholderTextColor={DARKER_GREY}
              blurOnSubmit={true}
            />
            {errors[1] ? (
              <Text style={styles.errorText}>{errors[1]}</Text>
            ) : null}
          </View>
          <Text style={styles.privacyText}>
            {t('signup.text.passwordInfo')}
          </Text>
        </View>
        <View style={styles.submitContainer}>
          <TouchableOpacity
            testID="submitBtn"
            style={[styles.submitBtn, { opacity: submitDisabled ? 0.7 : 1 }]}
            onPress={handleSubmit}
            accessibilityLabel={t('signup.button.submit')}
            disabled={submitDisabled}
          >
            <Text style={styles.submitBtnText}>
              {t('signup.button.submit')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.skipBtn, { opacity: skipDisabled ? 0.7 : 1 }]}
            onPress={handleSkip}
            accessibilityLabel={t('signup.button.skip')}
            testID="skipBtn"
            disabled={skipDisabled}
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
  invisibleUsername: {
    position: 'absolute',
    left: -100,
    width: 1,
    height: 1,
  },
  registerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    lineHeight: DEVICE_LARGE ? 26 : 24,
  },
  passwordContainer: {
    flexDirection: 'column',
    width: '60%',
    alignItems: 'center',
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    color: BLACK,
    borderBottomWidth: 1,
    borderBottomColor: DARKER_GREY,
    width: '100%',
    textAlign: 'center',
    paddingBottom: 10,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: RED,
    marginTop: 12,
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
