// @flow

import * as React from 'react';
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
import { connect } from 'react-redux';
import { setInternetCredentials } from 'react-native-keychain';
import { setBackupCompleted, setPassword } from '@/actions/index';
import emitter from '@/emitter';
import {
  DEVICE_IOS,
  DEVICE_ANDROID,
  BACKUP_URL,
  DEVICE_LARGE,
  ORANGE,
} from '@/utils/constants';
import { backupAppData } from './helpers';

type State = {
  pass1: string,
  pass2: string,
  completed: number,
  total: number,
  backupInProgress: boolean,
  isEditing: boolean,
};

const Container = DEVICE_IOS ? KeyboardAvoidingView : View;
// const Container = KeyboardAvoidingView;

class BackupScreen extends React.Component<Props, State> {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    pass1: '',
    pass2: '',
    completed: 0,
    total: 0,
    backupInProgress: false,
    isEditing: false,
  };

  componentDidMount() {
    const { navigation } = this.props;
    emitter.on('backupProgress', this.updateProgress);
    navigation.addListener('blur', () => {
      emitter.off('backupProgress', this.updateProgress);
    });
  }

  updateProgress = (num: number) => {
    this.setState(({ completed }) => ({
      completed: completed + num,
    }));
  };

  validatePass = () => {
    const { pass1, pass2 } = this.state;
    if (pass1 !== pass2) {
      Alert.alert('Error', 'Password and confirm password does not match.');
    } else if (pass1.length < 8) {
      Alert.alert('Error', 'Your password must be at least 8 characters long.');
    } else {
      return true;
    }
  };

  handleTextBlur = () => {
    this.setState({ isEditing: false });
  };

  handleTextFocus = () => {
    this.setState({ isEditing: true });
  };

  startBackup = async () => {
    if (!this.state.pass1 || (DEVICE_ANDROID && !this.validatePass())) return;

    try {
      const { dispatch, connections, groups, navigation, id } = this.props;

      dispatch(setPassword(this.state.pass1));

      try {
        await setInternetCredentials(BACKUP_URL, id, this.state.pass1);
      } catch (err) {
        console.log(err.message);
      }

      const groupsPhotoCount = groups.filter((group) => group.photo?.filename)
        .length;

      this.setState({
        backupInProgress: true,
        total: connections.length + groupsPhotoCount + 2,
      });

      await backupAppData();

      this.setState({
        backupInProgress: false,
      });

      dispatch(setBackupCompleted(true));

      Alert.alert('Info', 'Backup completed successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (err) {
      console.warn(err);
    }
  };

  render() {
    const { pass1, pass2, isEditing } = this.state;

    return (
      <>
        <View style={styles.orangeTop} />
        <Container style={styles.container} behavior="padding">
          <View style={styles.textInputContainer}>
            {(!isEditing || DEVICE_LARGE) && (
              <Text style={styles.textInfo}>
                Enter a password to encrypt your backup data with:
              </Text>
            )}
            <TextInput
              style={styles.invisibleUsername}
              placeholder="Username"
              textContentType="username"
              autoCompleteType="username"
              value={this.props.id}
            />

            <TextInput
              onChangeText={(pass) => this.setState({ pass1: pass })}
              value={pass1}
              placeholder="Password"
              placeholderTextColor="#9e9e9e"
              style={styles.textInput}
              autoCorrect={false}
              textContentType="newPassword"
              passwordRules="required: lower; required: upper; required: digit; required: [-]; minlength: 20;"
              autoCompleteType="password"
              underlineColorAndroid="transparent"
              secureTextEntry={true}
              onFocus={this.handleTextFocus}
            />

            {DEVICE_ANDROID && (
              <TextInput
                onChangeText={(pass) => this.setState({ pass2: pass })}
                value={pass2}
                placeholder="Confirm Password"
                placeholderTextColor="#9e9e9e"
                style={styles.textInput}
                autoCorrect={false}
                autoCompleteType="password"
                underlineColorAndroid="transparent"
                secureTextEntry={true}
                onBlur={this.handleTextBlur}
                onFocus={this.handleTextFocus}
                blurOnSubmit={true}
              />
            )}
          </View>
          <View style={styles.buttonContainer}>
            {!this.state.backupInProgress ? (
              <TouchableOpacity
                style={[
                  styles.startBackupButton,
                  !this.state.pass1 && styles.disabledButton,
                ]}
                onPress={this.startBackup}
                disabled={!this.state.pass1}
              >
                <Text style={styles.buttonInnerText}>Start Backup</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.loader}>
                <Text style={styles.textInfo}>
                  Uploading encrypted data to backup server ...
                </Text>
                <Text style={styles.textInfo}>
                  {this.state.completed}/{this.state.total} completed
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
  }
}

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: 70,
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
    fontSize: 18,
    color: '#333',
    margin: 18,
  },
  textInput: {
    fontFamily: 'ApexNew-Light',
    fontSize: 30,
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
    fontSize: 14,
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
    fontSize: 18,
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

export default connect(({ connections, groups, user }) => ({
  ...connections,
  ...groups,
  id: user.id,
}))(BackupScreen);
