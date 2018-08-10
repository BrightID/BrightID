// @flow

import * as React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';

/**
 * Connection screen of BrightID
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

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.makeConnectionTitle}>How to make a connection</Text>
        <Text style={styles.infoText}>
          To make a connection between two people, one person needs to display a
          QR code, and the other needs to scan it with their phone's camera.
          Please select one of the options below:
        </Text>
        <TouchableOpacity
          style={styles.displayQR}
          onPress={() => {
            this.props.navigation.navigate('DisplayQRCode');
          }}
        >
          <Text style={styles.buttonText}>Display QR Code</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scanQR}
          onPress={() => {
            this.props.navigation.navigate('QRCodeScanner');
          }}
        >
          <Text style={styles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>
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
  infoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
    marginTop: 16,
    width: '90%',
  },
  makeConnectionTitle: {
    fontFamily: 'ApexNew-Book',
    fontSize: 23,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginTop: 22,
  },
  displayQR: {
    borderWidth: 1,
    borderColor: '#4990e2',
    paddingTop: 13,
    paddingBottom: 12,
    width: '83.33%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  scanQR: {
    borderWidth: 1,
    borderColor: '#4990e2',
    paddingTop: 13,
    paddingBottom: 12,
    width: '83.33%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  buttonText: {
    fontFamily: 'ApexNew-Medium',
    color: '#4990e2',
  },
});

export default connect((state) => state.main)(NewConnectionScreen);
