// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import Simple from 'react-native-vector-icons/SimpleLineIcons';
import { shareConnection } from './actions/shareConnection';
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
  static navigationOptions = () => ({
    title: 'New Connection',
    headerRight: () => (
      <TouchableOpacity style={{ marginRight: 11 }} onPress={shareConnection}>
        <Simple name="share-alt" size={25} color="#fff" />
      </TouchableOpacity>
    ),
  });

  state = {
    display: 'qrcode',
  };

  renderScreen = () => {
    const { navigation } = this.props;
    const { display } = this.state;
    // boolean for displaying button styles
    // conditionally render MyCodeScreen
    if (display === 'qrcode') {
      return <MyCodeScreen navigation={navigation} />;
    } else if (display === 'scanner') {
      return <ScanCodeScreen navigation={navigation} />;
    } else if (!display) {
      return <View />;
    }
  };

  render() {
    const { display } = this.state;
    const qr = display === 'qrcode';
    return (
      <View style={styles.container}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
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
      </View>
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

export default connect((state) => state)(NewConnectionScreen);
