// @flow

import * as React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';

/**
 * Connection screen of BrightID
 * TODO: Add Connection screens
 */

type Props = {
  navigation: { navigate: Function },
  dispatch: Function,
};

class NewConnectionScreen extends React.Component<Props> {
  static navigationOptions = {
    title: 'New Connection',
    headerRight: <View />,
  };

  state = {
    display: 'qrcode',
  };

  render() {
    const { display } = this.state;
    // boolean for displaying button styles
    const qr = display === 'qrcode';

    return (
      <View style={styles.container}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={qr ? styles.buttonActive : styles.buttonDefault}
            accessible={true}
            accessibilityLabel="My Code"
            disabled={qr}
            onPress={() => {
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
            style={!qr ? styles.buttonActive : styles.buttonDefault}
            accessible={true}
            accessibilityLabel="Scan Code"
            disabled={!qr}
            onPress={() => {
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
        <Text style={styles.makeConnectionTitle}>How to make a connection</Text>
        <Text style={styles.infoText}>
          To make a connection between two people, one person needs to display a
          QR code, and the other needs to scan it with their phone's camera.
          Please select one of the options below:
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default connect((state) => state.main)(NewConnectionScreen);
