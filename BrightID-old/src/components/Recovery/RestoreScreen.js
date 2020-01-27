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
import emitter from '../../emitter';
import { recoverData } from './helpers';

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

  componentDidMount() {
    const { navigation } = this.props;
    emitter.on('restoreProgress', this.updateRestoreStatus);
    emitter.on('restoreTotal', this.updateRestoreTotal);
    navigation.addListener('willBlur', () => {
      emitter.off('restoreProgress', this.updateRestoreStatus);
      emitter.off('restoreTotal', this.updateRestoreTotal);
    });
  }

  updateRestoreStatus = (num: number) => {
    this.setState(({ completed }) => ({
      completed: completed + num,
    }));
  };

  updateRestoreTotal = (num: number) => {
    this.setState({
      total: num,
    });
  };

  restoreCompleted = async () => {
    const { navigation } = this.props;
    this.setState({
      restoreInProgress: false,
    });
    Alert.alert('Info', 'Your account recovered successfully!', [
      { text: 'OK', onPress: () => navigation.navigate('Home') },
    ]);
  };

  resetState = () => {
    this.setState({
      restoreInProgress: false,
      completed: 0,
      total: 0,
      pass: '',
    });
  };

  restore = () => {
    const { navigation } = this.props;
    this.setState({ restoreInProgress: true });
    recoverData(this.state.pass)
      .then((result) => {
        result ? this.restoreCompleted() : this.resetState();
      })
      .catch((err) => {
        this.resetState();
        err instanceof Error ? console.warn(err.message) : console.log(err);
        if (err instanceof Error && err.message === 'bad sigs') {
          Alert.alert(
            'Uh Oh',
            'One of your friends is not in your list of trusted connections',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        }
      });
  };

  renderButtonOrSpinner = () =>
    !this.state.restoreInProgress ? (
      <TouchableOpacity
        style={styles.startRestoreButton}
        onPress={this.restore}
      >
        <Text style={styles.buttonInnerText}>Start Restore</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.loader}>
        <Text style={styles.textInfo}>
          Downloading data from backup server ...
        </Text>
        {this.state.total !== 0 && (
          <Text style={styles.textInfo}>
            {this.state.completed}/{this.state.total} completed
          </Text>
        )}
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
          <Text style={styles.textInfo}>
            Enter a password that you encrypted your backup data with:
          </Text>
          <TextInput
            // eslint-disable-next-line no-shadow
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

export default connect((state) => state)(RestoreScreen);
