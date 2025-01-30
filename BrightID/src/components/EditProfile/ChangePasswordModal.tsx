import React, { useState, useContext } from 'react';
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
import { StackScreenProps } from '@react-navigation/stack';
import { useNodeApiContext } from '@/context/NodeApiContext';
import { BACKUP_URL, ORANGE } from '@/utils/constants';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import {
  DARK_ORANGE,
  LIGHT_GREY,
  DARKER_GREY,
  WHITE,
  BLACK,
  LIGHT_BLACK,
  GREEN,
  GREY,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { validatePass } from '@/utils/password';
import {
  setBackupCompleted,
  setPassword,
  updateNotifications,
} from '@/actions';
import { backupAppData } from '@/components/Onboarding/RecoveryFlow/thunks/backupThunks';
import { useDispatch, useSelector } from '@/store/hooks';
import { RootStackParamList } from '@/routes/navigationTypes';

const UploadAnimation = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.uploadAnimationContainer}>
      <Text style={styles.textInfo}>{t('common.text.uploadingData')}</Text>
      <Spinner
        isVisible={true}
        size={DEVICE_LARGE ? 80 : 65}
        type="Wave"
        color={ORANGE}
      />
    </View>
  );
};

type props = StackScreenProps<RootStackParamList, 'ChangePassword'>;

const ChangePasswordModal = ({ navigation }: props) => {
  const dispatch = useDispatch();
  const { api } = useNodeApiContext();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordAgain, setNewPasswordAgain] = useState('');
  const [backupInProgress, setBackupInProgress] = useState(false);

  const password = useSelector((state) => state.user.password);
  const id = useSelector((state) => state.user.id);

  const { t } = useTranslation();

  const savePasswordHandler = async () => {
    // check inputs
    if (password && oldPassword !== password) {
      Alert.alert(
        t('profile.alert.title.passwordMatch'),
        t('profile.alert.text.passwordMatch'),
      );
      return;
    }
    if (!validatePass(newPassword, newPasswordAgain)) return;

    // save new password
    try {
      await setInternetCredentials(BACKUP_URL, id, newPassword);
    } catch (err) {
      console.log(err.message);
    }
    dispatch(setPassword(newPassword));

    // backup data
    setBackupInProgress(true);
    try {
      await dispatch(backupAppData());
      dispatch(setBackupCompleted(true));
    } catch (err) {
      console.warn(err);
    }
    setBackupInProgress(false);

    // update notifications to make sure the `set backup password` notification is removed
    dispatch(updateNotifications(api));

    // finally close modal
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor={BLACK}
      />
      <View style={styles.modalContainer}>
        {backupInProgress ? (
          <UploadAnimation />
        ) : (
          <>
            {password ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t('profile.label.currentPassword')}
                </Text>
                <TextInput
                  autoComplete="password"
                  autoCorrect={false}
                  onChangeText={setOldPassword}
                  value={oldPassword}
                  placeholder={t('profile.label.currentPassword')}
                  placeholderTextColor={GREY}
                  secureTextEntry={true}
                  style={styles.textInput}
                  textContentType="password"
                  underlineColorAndroid="transparent"
                />
              </View>
            ) : null}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {password
                  ? t('profile.label.newPassword')
                  : t('profile.label.password')}
              </Text>
              <TextInput
                autoComplete="password"
                autoCorrect={false}
                onChangeText={setNewPassword}
                value={newPassword}
                placeholder={
                  password
                    ? t('profile.placeholder.newPassword')
                    : t('profile.placeholder.password')
                }
                placeholderTextColor={GREY}
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
                autoComplete="password"
                autoCorrect={false}
                onChangeText={setNewPasswordAgain}
                value={newPasswordAgain}
                placeholder={t('profile.placeholder.newPasswordAgain')}
                placeholderTextColor={GREY}
                secureTextEntry={true}
                style={styles.textInput}
                textContentType="password"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.saveContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={savePasswordHandler}
              >
                <Text style={styles.saveButtonText}>
                  {t('common.button.save')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  navigation.goBack();
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
