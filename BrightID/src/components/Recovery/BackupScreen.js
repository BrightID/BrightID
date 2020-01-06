// @flow

import * as React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import { setBackupCompleted, setPassword } from '../../actions/index';
import emitter from '../../emitter';

import { backupAppData } from './helpers';

type State = {
  pass1: string,
  pass2: string,
  completed: number,
  total: number,
  backupInProgress: boolean,
};

class BackupScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Backup',
    headerStyle: {
      backgroundColor: '#f48b1e',
    },
  };

  state = {
    pass1: '',
    pass2: '',
    completed: 0,
    total: 0,
    backupInProgress: false,
  };

  componentDidMount() {
    const { navigation } = this.props;
    emitter.on('backupProgress', this.updateProgress);
    navigation.addListener('willBlur', () => {
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

  startBackup = async () => {
    if (!this.validatePass()) return;
    try {
      const { dispatch, connections, navigation } = this.props;

      dispatch(setPassword(this.state.pass1));

      this.setState({
        backupInProgress: true,
        total: connections.length + 2,
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
    const { pass1, pass2 } = this.state;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <StatusBar
          barStyle="default"
          backgroundColor={Platform.OS === 'ios' ? 'transparent' : '#000'}
          translucent={false}
        />
        <View style={styles.textInputContainer}>
          <Text style={styles.textInfo}>
            Enter a password to encrypt your backup data with:
          </Text>
          <TextInput
            onChangeText={(pass) => this.setState({ pass1: pass })}
            value={pass1}
            placeholder="Password"
            placeholderTextColor="#9e9e9e"
            style={styles.textInput}
            autoCorrect={false}
            textContentType="password"
            autoCompleteType="password"
            underlineColorAndroid="transparent"
            secureTextEntry={true}
          />
          <TextInput
            onChangeText={(pass) => this.setState({ pass2: pass })}
            value={pass2}
            placeholder="Confirm Password"
            placeholderTextColor="#9e9e9e"
            style={styles.textInput}
            autoCorrect={false}
            textContentType="password"
            autoCompleteType="password"
            underlineColorAndroid="transparent"
            secureTextEntry={true}
          />
        </View>
        <View style={styles.buttonContainer}>
          {!this.state.backupInProgress ? (
            <TouchableOpacity
              style={styles.startBackupButton}
              onPress={this.startBackup}
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
              <Spinner isVisible={true} size={97} type="Wave" color="#4990e2" />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
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
    margin: 18,
  },
  textInput: {
    fontFamily: 'ApexNew-Light',
    fontSize: 30,
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
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

export default connect((state) => state)(BackupScreen);
