import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ORANGE, BLACK, WHITE, DARKER_GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE, DEVICE_OS } from '@/utils/deviceConstants';
import { recoverData } from './thunks/recoveryThunks';
import { CHANNEL_POLL_INTERVAL, clearChannel } from './thunks/channelThunks';

const Container = DEVICE_OS === 'ios' ? KeyboardAvoidingView : View;

// clear channel after this time
const channelTimeout = CHANNEL_POLL_INTERVAL * 3.1;

const RestoreScreen = () => {
  const [pass, setPass] = useState('');
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [timer, setTimer] = useState(Math.ceil(channelTimeout / 1000));

  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      // disable buttons until 3 passes of the the poll channel to make sure all data is downloaded
      const t = setTimeout(() => {
        clearChannel();
        setDisabled(false);
      }, channelTimeout);

      // display to user how long they are waiting for the button to be displayed
      const i = setInterval(() => {
        setTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
      return () => {
        clearTimeout(t);
        clearInterval(i);
      };
    }, []),
  );

  const restoreCompleted = async () => {
    Alert.alert(
      t('common.alert.info'),
      t('restore.alert.text.restoreSuccess'),
      [{ text: t('common.alert.ok') }],
    );
  };

  const resetState = () => {
    setRestoreInProgress(false);
    setPass('');
  };

  const skip = () => {
    setPass('');
    restore();
  };

  const restore = () => {
    setRestoreInProgress(true);

    dispatch(recoverData(pass))
      .then((result) => {
        result ? restoreCompleted() : resetState();
      })
      .catch((err) => {
        resetState();
        err instanceof Error ? console.warn(err.message) : console.log(err);
        if (err instanceof Error && err.message === 'bad password') {
          Alert.alert(
            t('common.alert.error'),
            t('common.alert.text.incorrectPassword'),
            [
              {
                text: t('common.alert.ok'),
              },
            ],
          );
        }
        if (err instanceof Error && err.message === 'bad sigs') {
          Alert.alert(
            t('restore.alert.title.notTrusted'),
            t('restore.alert.text.notTrusted'),
            [
              {
                text: t('common.alert.ok'),
                onPress: () => navigation.goBack(),
              },
            ],
          );
        }
      });
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <Container style={styles.container} behavior="padding">
        {!restoreInProgress ? (
          <>
            <View style={styles.textInputContainer}>
              <Text style={styles.textInfo}>
                {t('restore.text.enterPassword')}
              </Text>
              <TextInput
                onChangeText={setPass}
                value={pass}
                placeholder="Type your password"
                placeholderTextColor={DARKER_GREY}
                style={styles.textInput}
                autoCorrect={false}
                textContentType="password"
                autoCompleteType="password"
                underlineColorAndroid="transparent"
                secureTextEntry={true}
              />
            </View>
            <Text style={styles.skipInfo}>
              {t('restore.text.skipLoadingBackup')}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  pass.length < 1 || disabled ? { opacity: 0.5 } : {},
                ]}
                onPress={restore}
                accessibilityLabel="submit"
                disabled={pass.length < 1 || disabled}
              >
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.skipButton, disabled ? { opacity: 0.5 } : {}]}
                onPress={skip}
                accessibilityLabel="skip"
                disabled={disabled}
              >
                <Text style={styles.skipText}>
                  {disabled ? `... ${timer}` : t('restore.text.skip')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.loading}>
            <Spinner
              isVisible={true}
              size={DEVICE_LARGE ? 60 : 45}
              type="Wave"
              color={ORANGE}
            />
            <Text style={styles.textInfo}>
              {t('restore.text.downloadingData')}
            </Text>
          </View>
        )}
      </Container>
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
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  textInputContainer: {
    marginTop: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  textInfo: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: BLACK,
    margin: DEVICE_LARGE ? 18 : 16,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    color: DARKER_GREY,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DARKER_GREY,
    marginVertical: DEVICE_LARGE ? 60 : 50,
    width: '70%',
    textAlign: 'center',
    paddingBottom: DEVICE_LARGE ? 12 : 10,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  skipInfo: {
    fontFamily: 'Poppins-Regular',
    width: '70%',
    textAlign: 'center',
    color: DARKER_GREY,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: DEVICE_LARGE ? 40 : 32,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 120 : 100,
    height: DEVICE_LARGE ? 46 : 40,
    borderRadius: 60,
    backgroundColor: ORANGE,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  submitText: {
    fontFamily: 'Poppins-Bold',
    color: WHITE,
    fontSize: fontSize[16],
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 60,
    width: DEVICE_LARGE ? 120 : 100,
    height: DEVICE_LARGE ? 46 : 40,
    marginLeft: DEVICE_LARGE ? 20 : 16,
  },
  skipText: {
    fontFamily: 'Poppins-Medium',
    color: ORANGE,
    fontSize: fontSize[16],
  },
});

export default RestoreScreen;