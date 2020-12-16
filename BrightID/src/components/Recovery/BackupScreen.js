// @flow

import React, { useState, useCallback } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setInternetCredentials } from 'react-native-keychain';
import { useTranslation } from 'react-i18next';
import { setBackupCompleted, setPassword } from '@/actions/index';
import emitter from '@/emitter';
import { BACKUP_URL, ORANGE } from '@/utils/constants';
import { DEVICE_IOS, DEVICE_LARGE } from '@/utils/deviceConstants';
import { validatePass } from '@/utils/password';
import { backupAppData } from './helpers';

const Container = DEVICE_IOS ? KeyboardAvoidingView : View;
// const Container = KeyboardAvoidingView;

const BackupScreen = () => {
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const id = useSelector((state) => state.user.id);
  const connections = useSelector((state) => state.connections.connections);
  const groups = useSelector((state) => state.groups.groups);

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const updateProgress = (num: number) => {
        setCompleted((prev) => prev + num);
      };
      emitter.on('backupProgress', updateProgress);
      () => {
        emitter.off('backupProgress', updateProgress);
      };
    }, [setCompleted]),
  );

  const handleTextBlur = () => {
    setIsEditing(false);
  };

  const handleTextFocus = () => {
    setIsEditing(true);
  };

  const startBackup = async () => {
    if (!pass1 || !validatePass(pass1, pass2)) return;

    try {
      dispatch(setPassword(pass1));

      try {
        await setInternetCredentials(BACKUP_URL, id, pass1);
      } catch (err) {
        console.log(err.message);
      }

      const groupsPhotoCount = groups.filter((group) => group.photo?.filename)
        .length;

      setBackupInProgress(true);
      setTotal(connections.length + groupsPhotoCount + 2);

      // TODO: Any error happening inside backupAppData() is caught and just logged to console. Should this be changed?
      await backupAppData();

      setBackupInProgress(false);

      dispatch(setBackupCompleted(true));

      Alert.alert(
        t('common.alert.info'),
        t('backup.alert.text.backupSuccess'),
        [
          {
            text: t('common.alert.ok'),
            onPress: () => navigation.navigate('Home'),
          },
        ],
      );
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <Container style={styles.container} behavior="padding">
        <View style={styles.textInputContainer}>
          {(!isEditing || DEVICE_LARGE) && (
            <Text style={styles.textInfo}>
              {t('backup.text.enterPassword')}
            </Text>
          )}
          <TextInput
            style={styles.invisibleUsername}
            placeholder="Username"
            textContentType="username"
            autoCompleteType="username"
            value={id}
          />

          <TextInput
            onChangeText={setPass1}
            value={pass1}
            placeholder={t('common.placeholder.password')}
            placeholderTextColor="#9e9e9e"
            style={styles.textInput}
            autoCorrect={false}
            textContentType="newPassword"
            passwordRules="required: lower; required: upper; required: digit; required: [-]; minlength: 20;"
            autoCompleteType="password"
            underlineColorAndroid="transparent"
            secureTextEntry={true}
            onFocus={handleTextFocus}
          />
          <TextInput
            onChangeText={setPass2}
            value={pass2}
            placeholder={t('backup.placeholder.confirmPassword')}
            textContentType="newPassword"
            placeholderTextColor="#9e9e9e"
            style={styles.textInput}
            autoCorrect={false}
            autoCompleteType="password"
            underlineColorAndroid="transparent"
            secureTextEntry={true}
            onBlur={handleTextBlur}
            onFocus={handleTextFocus}
            blurOnSubmit={true}
          />
        </View>
        <View style={styles.buttonContainer}>
          {!backupInProgress ? (
            <TouchableOpacity
              style={[
                styles.startBackupButton,
                !pass1 && styles.disabledButton,
              ]}
              onPress={startBackup}
              disabled={!pass1}
            >
              <Text style={styles.buttonInnerText}>
                {t('backup.button.startBackup')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.loader}>
              <Text style={styles.textInfo}>
                {t('common.text.uploadingData')}
              </Text>
              <Text style={styles.textInfo}>
                {t('common.text.progress', {
                  completed,
                  total,
                })}
              </Text>
              <Spinner
                isVisible={true}
                size={DEVICE_LARGE ? 80 : 65}
                type="Wave"
                color="#333"
              />
            </View>
          )}
        </View>
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
  },
  buttonContainer: {
    marginTop: 44,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  textInfo: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_LARGE ? 18 : 16,
    color: '#333',
    margin: 18,
  },
  textInput: {
    fontFamily: 'ApexNew-Light',
    fontSize: DEVICE_LARGE ? 24 : 20,
    color: '#333',
    fontWeight: '300',
    fontStyle: 'normal',
    letterSpacing: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9e9e9e',
    marginTop: 22,
    width: 275,
    textAlign: 'left',
    paddingBottom: 5,
  },
  invisibleUsername: {
    position: 'absolute',
    left: -100,
    width: 1,
    height: 1,
  },
  buttonInfoText: {
    fontFamily: 'ApexNew-Book',
    color: '#9e9e9e',
    fontSize: DEVICE_LARGE ? 14 : 12,
    width: 298,
    textAlign: 'center',
  },
  startBackupButton: {
    backgroundColor: '#428BE5',
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 12,
    marginTop: 22,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: DEVICE_LARGE ? 18 : 16,
  },
  button: {
    width: 300,
    borderWidth: 1,
    borderColor: '#4990e2',
    paddingTop: 13,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.4,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

// export default connect(({ connections, groups, user }) => ({
//   ...connections,
//   ...groups,
//   id: user.id,
// }))(withTranslation()(BackupScreen));

export default BackupScreen;
