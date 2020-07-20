// @flow

import * as React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { connect } from 'react-redux';
import MyCodeScreen from './MyCodeScreen';
import ScanCodeScreen from './ScanCodeScreen';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

/**
 * Connection screen of BrightID
 *
 * renders MyCodeScreen / ScanCodeScreen
 */

type State = {
  display: string,
};

export class NewConnectionScreen extends React.Component<Props, State> {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    display: 'qrcode',
  };

  renderScreen = () => {
    const { display } = this.state;
    // boolean for displaying button styles
    // conditionally render MyCodeScreen
    if (display === 'qrcode') {
      return <MyCodeScreen />;
    } else if (display === 'scanner') {
      return <ScanCodeScreen />;
    } else if (!display) {
      return <View />;
    }
  };

  render() {
    const { display } = this.state;
    const qr = display === 'qrcode';
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            testID="myCodeBtn"
            style={qr ? styles.buttonActive : styles.buttonDefault}
            accessible={true}
            accessibilityLabel="My Code"
            disabled={qr}
            onPress={async () => {
              // display qrcode
              this.setState({
                display: 'qrcode',
              });
            }}
          >
            <Text
              style={qr ? styles.buttonTextActive : styles.buttonTextDefault}
            >
              My Code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="scanCodeBtn"
            style={!qr ? styles.buttonActive : styles.buttonDefault}
            accessible={true}
            accessibilityLabel="Scan Code"
            disabled={!qr}
            onPress={async () => {
              // display qrcode scanner
              this.setState({
                display: 'scanner',
              });
            }}
          >
            <Text
              style={!qr ? styles.buttonTextActive : styles.buttonTextDefault}
            >
              Scan Code
            </Text>
          </TouchableOpacity>
        </View>
        {this.renderScreen()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  buttonsContainer: {
    height: 55,
    width: '100%',
    flexDirection: 'row',
  },
  buttonDefault: {
    width: '50%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e3e0e0',
  },
  buttonActive: {
    width: '50%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1c6b9',
  },
  buttonTextDefault: {
    color: '#4a4a4a',
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  buttonTextActive: {
    color: '#4a4a4a',
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
});

export default connect()(NewConnectionScreen);
