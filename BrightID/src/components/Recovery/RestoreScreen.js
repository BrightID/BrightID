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
import { createDecipher } from 'react-native-crypto';
import api from '../../Api/BrightId';
import backupApi from '../../Api/BackupApi';
import { b64ToUrlSafeB64 } from '../../utils/encoding';
import emitter from '../../emitter';
import { saveImage } from '../../utils/filesystem';
import { saveConnection } from '../../actions/connections';
import { setUserData, setBackupCompleted } from '../../actions';

type State = {
  pass: string,
  completed: number,
  total: number,
  restoreInProgress: boolean,
};

class RestoreScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Restore',
    headerStyle: {
      backgroundColor: '#f48b1e',
    },
  };

  state = {
    pass: '',
    completed: 0,
    total: 0,
    restoreInProgress: false,
  };

  restoreCompleted = async () => {
    const { navigation } = this.props;
    this.setState({
      restoreInProgress: false,
    });
    Alert.alert(
      'Info',
      'Your account recovered successfully!',
      [{text: 'OK', onPress: () => navigation.navigate('Home')}]
    );
  }

  restore = async (k1, k2) => {
    const decipher = createDecipher('aes128', this.state.pass);
    const res = await backupApi.get(k1, k2);
    this.setState({
      completed: this.state.completed + 1
    });
    const decrypted = decipher.update(res.data, 'base64', 'utf8') + decipher.final('utf8');
    return decrypted
  }

  startRestore = async () => {
    try {
      this.setState({ restoreInProgress: true });

      const { id, secretKey, publicKey } = this.props.navigation.state.params;
      let decrypted = await this.restore(id, 'data');
      
      const { userData, connections } = JSON.parse(decrypted);
      
      this.setState({ total: connections.length + 2 });
      
      for (const conn of connections) {
        decrypted = await this.restore(id, conn.id);
        const filename = await saveImage({
          imageName: conn.id,
          base64Image: decrypted,
        });
        conn.photo = { filename };
        // add connection inside of async storage
        await saveConnection(conn);
      }
      emitter.emit('refreshConnections', {});

      userData.id = id;
      userData.publicKey = publicKey;
      userData.secretKey = secretKey;
      decrypted = await this.restore(id, id);
      const filename = await saveImage({
        imageName: userData.id,
        base64Image: decrypted,
      });
      userData.photo = { filename };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      // user should be able to use old backup and there is no need to backup again
      await AsyncStorage.setItem('backupCompleted', 'true');
      await this.props.dispatch(setBackupCompleted(true));
      // password is required to update backup when user makes new connections
      await AsyncStorage.setItem('password', JSON.stringify(this.state.pass));
      
      await this.props.dispatch(setUserData(userData));
      this.restoreCompleted();

    } catch (err) {
      if (err.message == 'unable to decrypt data') {
        this.setState({ restoreInProgress: false, completed: 0 });
        Alert.alert(
          'Error',
          'Incorrect password!',
        );
      } else {
        console.log(err.message);  
      }
    }
  };

  renderButtonOrSpinner = () =>
    !this.state.restoreInProgress ? (
      <TouchableOpacity
        style={styles.startRestoreButton}
        onPress={this.startRestore}
      >
        <Text style={styles.buttonInnerText}>Start Restore</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.loader}>
        <Text style={styles.textInfo}>Downloading data from backup server ...</Text>
        <Text style={styles.textInfo}>{this.state.completed}/{this.state.total} completed</Text>
        <Spinner isVisible={true} size={97} type="Wave" color="#4990e2" />
      </View>
    );

  render() {
    const { pass } = this.state;
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <StatusBar
          barStyle="default"
          backgroundColor={Platform.OS === 'ios' ? 'transparent' : '#000'}
          translucent={false}
        />
        <View style={styles.textInputContainer}>
          <Text style={styles.textInfo}>Enter a password that you encrypted your backup data with:</Text>
          <TextInput
            onChangeText={(pass) => this.setState({ pass })}
            value={pass}
            placeholder="Password"
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
  startRestoreButton: {
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

export default connect((state) => state.main)(RestoreScreen);