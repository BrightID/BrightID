// @flow

import React, { useCallback, useState } from 'react';
import {
  Alert,
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Spinner from 'react-native-spinkit';
import { setInternetCredentials } from 'react-native-keychain';
import { useTranslation } from 'react-i18next';
import { BACKUP_URL } from '@/utils/constants';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import {
  DARK_ORANGE,
  LIGHT_GREY,
  DARKER_GREY,
  WHITE,
  LIGHT_BLACK,
  GREEN,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { validatePass } from '@/utils/password';
import { setPassword } from '@/actions';
import { backupAppData } from '@/components/Recovery/helpers';
import emitter from '@/emitter';

/**
 * Search Bar in the Groups Screen
 *
 * TODO: Create a shared search component to use in both Connections and Group view
 */

const UploadAnimation = () => {
  const [completed, setCompleted] = useState(0);
  const backupTotal = useSelector(
    (state) =>
      2 +
      state.connections.connections.length +
      state.groups.groups.filter((group) => group.photo?.filename).length,
  );

  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      const updateProgress = (num) => {
        setCompleted((completed) => completed + num);
      };

      emitter.on('backupProgress', updateProgress);

      return () => {
        emitter.off('backupProgress', updateProgress);
      };
    }, []),
  );

  return (
    <View style={styles.uploadAnimationContainer}>
      <Text style={styles.textInfo}>{t('common.text.uploadingData')}</Text>
      <Text style={styles.textInfo}>
        {t('common.text.progress', {
          completed,
          total: backupTotal,
        })}
      </Text>
      <Spinner
        isVisible={true}
        size={DEVICE_LARGE ? 80 : 65}
        type="Wave"
        color="#333"
      />
    </View>
  );
};

const ChangePasswordModal = ({ route, navigation }) => {
  const dispatch = useDispatch();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordAgain, setNewPasswordAgain] = useState('');
  const [backupInProgress, setBackupInProgress] = useState(false);

  const password = useSelector((state) => state.user.password);
  const id = useSelector((state) => state.user.id);

  const { t } = useTranslation();

  // backupTotal is used to display the upload animation

  const startBackup = async () => {
    if (oldPassword !== password) {
      Alert.alert(
        t('profile.alert.title.passwordMatch'),
        t('profile.alert.text.passwordMatch'),
      );
      return;
    }
    if (!validatePass(newPassword, newPasswordAgain)) return;

    try {
      await setInternetCredentials(BACKUP_URL, id, newPassword);
    } catch (err) {
      console.log(err.message);
    }

    try {
      dispatch(setPassword(newPassword));

      setBackupInProgress(true);

      await backupAppData();

      setBackupInProgress(false);

      navigation.navigate('Edit Profile');
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor="black"
      />
      <View style={styles.modalContainer}>
        {backupInProgress ? (
          <UploadAnimation />
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.label.currentPassword')}
              </Text>
              <TextInput
                autoCompleteType="password"
                autoCorrect={false}
                onChangeText={setOldPassword}
                value={oldPassword}
                placeholder={password}
                placeholderTextColor="#9e9e9e"
                secureTextEntry={true}
                style={styles.textInput}
                textContentType="password"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.label.newPassword')}</Text>
              <TextInput
                autoCompleteType="password"
                autoCorrect={false}
                onChangeText={setNewPassword}
                value={newPassword}
                placeholder={t('profile.placeholder.newPassword')}
                placeholderTextColor="#9e9e9e"
                secureTextEntry={true}
                style={styles.textInput}
                textContentType="password"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.label.newPasswordAgain')}
              </Text>
              <TextInput
                autoCompleteType="password"
                autoCorrect={false}
                onChangeText={setNewPasswordAgain}
                value={newPasswordAgain}
                placeholder={t('profile.placeholder.newPasswordAgain')}
                placeholderTextColor="#9e9e9e"
                secureTextEntry={true}
                style={styles.textInput}
                textContentType="password"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.saveContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={startBackup}>
                <Text style={styles.saveButtonText}>
                  {t('common.button.save')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  navigation.navigate('Edit Profile');
                }}
              >
                <Text style={styles.cancelButtonText}>
                  {t('common.button.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  photo: {
    width: '100%',
    flex: 1,
  },
  modalContainer: {
    backgroundColor: WHITE,
    width: '75%',
    borderRadius: 25,
    padding: DEVICE_LARGE ? 36 : 30,
  },
  inputGroup: {
    borderBottomColor: LIGHT_GREY,
    borderBottomWidth: 1,
    marginBottom: DEVICE_LARGE ? 12 : 10,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[13],
    color: DARK_ORANGE,
    marginBottom: DEVICE_IOS ? (DEVICE_LARGE ? 15 : 13) : 0,
  },
  textInput: {
    fontSize: fontSize[12],
    marginBottom: DEVICE_IOS ? (DEVICE_LARGE ? 10 : 8) : 0,
  },
  saveContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: DEVICE_LARGE ? 14 : 12,
  },
  saveButton: {
    width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: DEVICE_LARGE ? 22 : 18,
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
  },
  cancelButton: {
    width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DARKER_GREY,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: DARKER_GREY,
  },
  textInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[16],
    color: LIGHT_BLACK,
    margin: DEVICE_LARGE ? 12 : 10,
  },
  uploadAnimationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

export default ChangePasswordModal;
