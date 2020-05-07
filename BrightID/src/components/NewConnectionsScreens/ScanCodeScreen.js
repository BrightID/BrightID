// @flow

import * as React from 'react';
import { Alert, Linking, StyleSheet, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
import Spinner from 'react-native-spinkit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DEVICE_LARGE } from '@/utils/constants';
import RNCamera from './RNCameraProvider.e2e';
import { parseQrData } from './actions/parseQrData';
import { fetchData } from './actions/fetchData';
import emitter from '../../emitter';
import { removeConnectQrData } from '../../actions';

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
  value: string,
};

export class ScanCodeScreen extends React.Component<Props, State> {
  textInput: null | TextInput;

  camera: null | RNCamera;

  // eslint-disable-next-line react/state-in-constructor
  state = {
    scanned: false,
    connectionAttempts: 0,
    value: '',
  };

  connectionExpired: TimeoutID;

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(removeConnectQrData());
    emitter.on('connectDataReady', this.navigateToPreview);
    emitter.on('connectFailure', this.handleDownloadFailure);
    emitter.on('recievedProfileData', this.unsubscribeToProfileUpload);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    this.unsubscribeToProfileUpload();
    emitter.off('connectDataReady', this.navigateToPreview);
    emitter.off('connectFailure', this.handleDownloadFailure);
    emitter.off('recievedProfileData', this.unsubscribeToProfileUpload);
    dispatch(removeConnectQrData());
  }

  subscribeToProfileUpload = () => {
    const { dispatch } = this.props;
    this.connectionExpired = setTimeout(this.showProfileError, 90000);
    this.fetchProfileData = setInterval(() => {
      dispatch(fetchData());
    }, 1000);
  };

  unsubscribeToProfileUpload = () => {
    clearTimeout(this.connectionExpired);
    clearInterval(this.fetchProfileData);
  };

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
    console.log('barcode data', data);
    if (!data) return;

    if (data.startsWith('Recovery_')) {
      navigation.navigate('RecoveringConnection', {
        recoveryRequestCode: data,
      });
      this.setState({ scanned: true });
    } else if (data.startsWith('brightid://')) {
      Linking.openURL(data);
      this.setState({ scanned: true });
    } else if (validQrString(data)) {
      dispatch(parseQrData(data));
      // If the following `fetchdata()` fails, a "connectFailure" will be emitted,
      this.subscribeToProfileUpload();
      this.setState({ scanned: true });
      if (this.textInput) this.textInput.blur();
    }
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
        <View style={styles.cameraPreview} testID="scanCode">
          <View style={styles.scanTextContainer}>
            <TextInput
              ref={(c) => {
                this.textInput = c;
              }}
              style={styles.searchField}
              onBlur={() => {
                this.handleBarCodeRead({
                  type: 'text-input',
                  data: this.state.value.trim(),
                });
              }}
              onChangeText={(value) => {
                this.setState({ value });
              }}
              placeholder="Scan or paste a BrightID code here"
              placeholderTextColor="#333"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="none"
              underlineColorAndroid="transparent"
              blurOnSubmit={true}
            />
          </View>
          <RNCamera
            ref={(ref) => {
              this.camera = ref;
            }}
            style={styles.cameraPreview}
            captureAudio={false}
            onBarCodeRead={this.handleBarCodeRead}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
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
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    width: '85%',
    textAlign: 'center',
  },
});

export default connect()(ScanCodeScreen);
