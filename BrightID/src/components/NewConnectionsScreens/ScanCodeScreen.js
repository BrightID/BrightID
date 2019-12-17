// @flow

import * as React from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
import { RNCamera } from 'react-native-camera';
import Spinner from 'react-native-spinkit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { parseQrData } from './actions/parseQrData';
import { fetchData } from './actions/fetchData';
import emitter from '../../emitter';
import { removeConnectQrData } from '../../actions';
import { setUpWs } from './actions/websocket';

/**
 * Returns whether the string is a valid QR identifier
 * @param {*} qrString
 */
function validQrString(qrString) {
  return qrString.length >= 42;
}

/**
 * Scan code screen of BrightID
 * ==================================================================
 * displays a react-native-camera view
 * after scanning qrcode - the rtc id is set
 *
 */

type State = {
  scanned: boolean,
  connectionAttempts: number,
};

export class ScanCodeScreen extends React.Component<Props, State> {
  textInput: null | TextInput;

  camera: null | RNCamera;

  state = {
    scanned: false,
    connectionAttempts: 0,
  };

  connectionExpired: TimeoutID;

  socket: { close: () => null };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(removeConnectQrData());
    emitter.on('connectDataReady', this.navigateToPreview);
    emitter.on('connectFailure', this.handleDownloadFailure);
    emitter.on('profileNotReady', this.subscribeToProfileUpload);
  }

  componentWillUnmount() {
    emitter.off('connectDataReady', this.navigateToPreview);
    emitter.off('connectFailure', this.handleDownloadFailure);
    emitter.off('profileNotReady', this.subscribeToProfileUpload);
    clearTimeout(this.connectionExpired);
  }

  handleDownloadFailure = () => {
    this.setState((prev) => ({
      connectionAttempts: prev.connectionAttempts + 1,
    }));
    if (this.state.connectionAttempts > 1) {
      this.navigateToHome();
    } else {
      this.subscribeToProfileUpload();
    }
  };

  handleBarCodeRead = ({ data }) => {
    const { dispatch, navigation } = this.props;

    if (data.startsWith('Recovery_')) {
      navigation.navigate('RecoveringConnection', {
        recoveryRequestCode: data,
      });
    } else if (validQrString(data)) {
      dispatch(parseQrData(data));
      // If the following `fetchdata()` fails, a "connectFailure" will be emitted,
      // triggering a single retry through a websocket notification.
      dispatch(fetchData());
      this.setState({ scanned: true });
      if (this.textInput) this.textInput.blur();
    }
  };

  subscribeToProfileUpload = () => {
    this.socket = this.props.dispatch(setUpWs());
    this.connectionExpired = setTimeout(this.showProfileError, 90000);
  };

  navigateToPreview = () => {
    this.props.navigation.navigate('PreviewConnection');
  };

  showProfileError = () => {
    Alert.alert(
      'Timeout reached',
      "There was a problem downloading the other person's profile. Please try again.",
    );
    this.setState({ scanned: false });
  };

  navigateToHome = () => {
    this.props.navigation.navigate('Home');
  };

  renderCameraOrWave = () => {
    // either camera is showing or webrtc is connecting
    const { scanned } = this.state;
    if (scanned) {
      return (
        <View style={styles.cameraPreview}>
          <Spinner isVisible={true} size={41} type="Wave" color="#4990e2" />
        </View>
      );
    } else {
      return (
        <View style={styles.cameraPreview}>
          <View style={styles.scanTextContainer}>
            <TextInput
              ref={(c) => {
                this.textInput = c;
              }}
              onChangeText={(value) => {
                this.handleBarCodeRead({
                  type: 'text-input',
                  data: value.trim(),
                });
              }}
              style={styles.searchField}
              placeholder="Scan a BrightID code to make a connection"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="none"
              underlineColorAndroid="transparent"
            />
          </View>
          <RNCamera
            ref={(ref) => {
              this.camera = ref;
            }}
            style={styles.cameraPreview}
            onBarCodeRead={this.handleBarCodeRead}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
            permissionDialogTitle="Permission to use camera"
            permissionDialogMessage="We need your permission to use your camera phone"
          >
            <Ionicons name="ios-qr-scanner" size={223} color="#F76B1C" />
          </RNCamera>
        </View>
      );
    }
  };

  render() {
    return <View style={styles.container}>{this.renderCameraOrWave()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  cameraPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scanTextContainer: {
    height: 85,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    zIndex: 100,
  },
  searchField: {
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    width: '85%',
  },
});

export default connect((state) => state)(ScanCodeScreen);
