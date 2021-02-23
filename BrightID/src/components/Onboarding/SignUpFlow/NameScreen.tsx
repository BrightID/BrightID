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
import { useDispatch, useSelector } from '@/store';
import { useNavigation } from '@react-navigation/native';
import { fontSize } from '@/theme/fonts';
import { WHITE, BLACK, DARKER_GREY, ORANGE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { setName } from '@/actions';

/* Description */

/* ======================================== */

/**
 * Initial Onboarding screen of BrightID
 */

/* Onboarding Screen */

/* ======================================== */
export const NameScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const name = useSelector((state: State) => state.user.name);
  const [displayName, setDisplayName] = useState(name);
  const handleSubmit = () => {
    dispatch(setName(displayName));
    navigation.navigate('SignUpPhoto');
  };

  const disabled = displayName.length < 2;

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="NameScreen">
        <View style={styles.descContainer}>
          <Text style={styles.registerText}>
            {t('signup.text.whatsYouName')}
          </Text>
        </View>
        <View style={styles.midContainer}>
          <TextInput
            testID="editName"
            onChangeText={setDisplayName}
            value={displayName}
            placeholder={t('signup.placeholder.name')}
            placeholderTextColor={DARKER_GREY}
            style={styles.textInput}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="name"
            underlineColorAndroid="transparent"
            blurOnSubmit={true}
          />
          <Text style={styles.privacyText}>
            {t('signup.text.nameNotShared')}
          </Text>
        </View>
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitBtn, { opacity: disabled ? 0.7 : 1 }]}
            onPress={handleSubmit}
            accessibilityLabel={t('signup.button.submit')}
            disabled={disabled}
            testID="submitName"
          >
            <Text style={styles.submitBtnText}>
              {t('signup.button.submit')}
            </Text>
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
    justifyContent: 'center',
  },
  registerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    lineHeight: DEVICE_LARGE ? 26 : 24,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[16],
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
    marginTop: DEVICE_LARGE ? 36 : 30,
    width: '72%',
  },
  submitContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: DEVICE_LARGE ? 85 : 70,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 180 : 160,
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
});

export default NameScreen;
