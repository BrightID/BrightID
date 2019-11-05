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
  AsyncStorage
} from 'react-native';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import { setBackupCompleted } from '../../actions/index';
import { retrieveImage } from '../../utils/filesystem';
import { createCipher } from 'react-native-crypto';
import api from '../../Api/BrightId';
import backupApi from '../../Api/BackupApi';

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

  backupCompleted = async () => {
    const { dispatch, navigation } = this.props;
    await AsyncStorage.setItem('backupCompleted', 'true');
    dispatch(setBackupCompleted(true));
    this.setState({
      backupInProgress: false,  
    })
    Alert.alert(
      'Info',
      'Backup completed successfully!',
      [{text: 'OK', onPress: () => navigation.navigate('Home')}]
    );
  }

  backup = async (k1, k2, data) => {
    let cipher = createCipher('aes128', this.state.pass1);
    const encrypted = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
    await backupApi.set(k1, k2, encrypted);
    this.setState({
      completed: this.state.completed + 1
    });
  }

  startBackup = async () => {
    try {
      const { pass1, pass2 } = this.state;
      const { score, name, photo, safePubKey, publicKey, connections, trustedConnections } = this.props;
      if (pass1 != pass2) {
        return Alert.alert('Password and confirm password does not match.');
      }
      // TODO: check password strength
      const userData = { publicKey, safePubKey, name, score };
      this.setState({
        backupInProgress: true, 
        total: connections.length + 2
      });
      
      let dataStr;
      dataStr = await retrieveImage(photo.filename);
      await this.backup(safePubKey, safePubKey, dataStr);
      for (const item of connections) {
        dataStr = await retrieveImage(item.photo.filename);
        await this.backup(safePubKey, item.publicKey, dataStr);
      }
      dataStr = JSON.stringify({userData, connections});
      await this.backup(safePubKey, 'data', dataStr);
      
      await api.trustedConnections(trustedConnections.join(','));
      this.backupCompleted();
    } catch (err) {
      console.warn(err.message);
    }
  };

  renderButtonOrSpinner = () =>
    !this.state.backupInProgress ? (
      <TouchableOpacity
        style={styles.startBackupButton}
        onPress={this.startBackup}
      >
        <Text style={styles.buttonInnerText}>Start Backup</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.loader}>
        <Text style={styles.textInfo}>Uploading encrypted data to backup server ...</Text>
        <Text style={styles.textInfo}>{this.state.completed}/{this.state.total} completed</Text>
        <Spinner isVisible={true} size={97} type="Wave" color="#4990e2" />
      </View>
    );

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
          <Text style={styles.textInfo}>Enter a password to encrypt your backup data with:</Text>
          <TextInput
            onChangeText={(pass1) => this.setState({ pass1 })}
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
            onChangeText={(pass2) => this.setState({ pass2 })}
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
          {this.renderButtonOrSpinner()}
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

export default connect((state) => state.main)(BackupScreen);
