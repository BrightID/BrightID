// @flow

import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE, DEVICE_OS } from '@/utils/deviceConstants';
import { recoverData } from './thunks/recoveryThunks';

const Container = DEVICE_OS === 'ios' ? KeyboardAvoidingView : View;

const RestoreScreen = () => {
  const [pass, setPass] = useState('');
  const [restoreInProgress, setRestoreInProgress] = useState(false);

  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

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
                placeholderTextColor="#707070"
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
                  pass.length < 1 ? { opacity: 0.5 } : {},
                ]}
                onPress={restore}
                accessibilityLabel="submit"
                disabled={pass.length < 1}
              >
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={skip}
                accessibilityLabel="skip"
              >
                <Text style={styles.skipText}>Skip</Text>
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
            <Text style={styles.textInfo}>Downloading data ...</Text>
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
    backgroundColor: '#fff',
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
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#000',
    margin: DEVICE_LARGE ? 18 : 16,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#707070',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9e9e9e',
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
    color: '#707070',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  submitText: {
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: DEVICE_LARGE ? 16 : 14,
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
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
});

export default RestoreScreen;
