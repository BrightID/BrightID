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
import {
  DEVICE_LARGE,
  DEVICE_ANDROID,
  BACKUP_URL,
  DEVICE_IOS,
} from '@/utils/constants';
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
      <Text style={styles.textInfo}>
        Uploading encrypted data to backup server ...
      </Text>
      <Text style={styles.textInfo}>
        {completed}/{backupTotal} completed
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

  // backupTotal is used to display the upload animation

  const startBackup = async () => {
    if (oldPassword !== password) {
      Alert.alert('Please try again', 'Current password does not match.');
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
              <Text style={styles.label}>Current password</Text>
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
              <Text style={styles.label}>New password</Text>
              <TextInput
                autoCompleteType="password"
                autoCorrect={false}
                onChangeText={setNewPassword}
                value={newPassword}
                placeholder="new password"
                placeholderTextColor="#9e9e9e"
                secureTextEntry={true}
                style={styles.textInput}
                textContentType="password"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New password again</Text>
              <TextInput
                autoCompleteType="password"
                autoCorrect={false}
                onChangeText={setNewPasswordAgain}
                value={newPasswordAgain}
                placeholder="new password again"
                placeholderTextColor="#9e9e9e"
                secureTextEntry={true}
                style={styles.textInput}
                textContentType="password"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.saveContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={startBackup}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  navigation.navigate('Edit Profile');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
    backgroundColor: '#fff',
    width: '75%',
    borderRadius: 25,
    padding: DEVICE_LARGE ? 36 : 30,
  },
  inputGroup: {
    borderBottomColor: '#C4C4C4',
    borderBottomWidth: 1,
    marginBottom: DEVICE_LARGE ? 12 : 10,
  },
  label: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 13 : 11,
    color: '#B64B32',
    marginBottom: DEVICE_IOS ? (DEVICE_LARGE ? 15 : 13) : 0,
  },
  textInput: {
    fontSize: DEVICE_LARGE ? 12 : 11,
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
    backgroundColor: '#5DEC9A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: DEVICE_LARGE ? 22 : 18,
  },
  saveButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
  },
  cancelButton: {
    width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#707070',
  },
  cancelButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#707070',
  },
  textInfo: {
    fontFamily: 'Poppins',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
    margin: DEVICE_LARGE ? 12 : 10,
  },
  uploadAnimationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

export default ChangePasswordModal;
