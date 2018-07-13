// @flow

import * as React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
// import { Camera, BarCodeScanner, Permissions } from 'expo';
import { RNCamera } from 'react-native-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * Connection screen of BrightID
 */

type Props = {
  navigation: { navigate: Function },
};

type State = {
  hasCameraPermission: boolean,
  scanBarcode: boolean,
  type: string,
};

class BarcodeScannerScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Scan Barcode',
  };
  state = {
    hasCameraPermission: false,
    scanBarcode: false,
    // type: Camera.Constants.Type.back,
    qrData: '',
    dataFound: false,
  };

  async componentWillMount() {
    // const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }
  handleBarCodeRead = ({ type, data }) => {
    this.setState({ qrData: data, dataFound: true });
    if (!this.state.dataFound) {
      Alert.alert(data);
    }
  };
  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return (
        <View style={styles.container}>
          <Text>Requesting for camera permission</Text>
        </View>
      );
    } else if (hasCameraPermission === false) {
      return (
        <View style={styles.container}>
          <Text>No access to camera</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          {/* <BarCodeScanner
            onBarCodeRead={this.handleBarCodeRead}
            style={styles.barcodeScanner}
          >
            <Ionicons name="ios-qr-scanner" size={223} color="#F76B1C" />
          </BarCodeScanner> */}
        </View>
      );
    }
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
  barcodeScanner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect((state) => state.main)(BarcodeScannerScreen);
