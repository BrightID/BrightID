// @flow

import * as React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
// import Permissions from 'react-native-permissions'
import { RNCamera } from 'react-native-camera';
import Spinner from 'react-native-spinkit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { parseQrData } from '../../actions/parseQrData';
import { fetchData } from '../../actions/fetchData';
import { encryptAndUploadLocalData } from '../../actions/encryptData';
import emitter from '../../emitter';

/**
 * Scan code screen of BrightID
 * ==================================================================
 * displays a react-native-camera view
 * after scanning qrcode - the rtc id is set
 *
 */

type Props = {
  dispatch: () => null,
  navigation: { navigate: () => null },
  rtcId: string,
  hangUp: () => null,
  rtcOn: boolean,
};

type State = {
  hasCameraPermission: boolean,
  type: string,
};

class ScanCodeScreen extends React.Component<Props, State> {
  state = {
    scanned: false,
  };

  componentDidMount() {
    emitter.on('connectDataReady', this.navigateToPreview);
  }

  componentWillUnmount() {
    emitter.off('connectDataReady', this.navigateToPreview);
  }

  handleBarCodeRead = ({ type, data }) => {
    const { dispatch } = this.props;
    dispatch(parseQrData({ data, user: 2 }));
    setTimeout(() => dispatch(encryptAndUploadLocalData()));
    setTimeout(() => dispatch(fetchData()));
    this.setState({ scanned: true });
  };

  navigateToPreview = () => {
    this.props.navigation.navigate('PreviewConnection');
  };

  renderCameraOrWave = () => {
    // either camera is showing or webrtc is connecting
    const { scanned } = this.state;
    if (scanned) {
      return (
        <View style={styles.cameraPreview}>
          {/* <WebRTCLogic user="UserB" hangUp={hangUp} navigation={navigation} /> */}
          <Spinner
            style={styles.spinner}
            isVisible={true}
            size={41}
            type="Wave"
            color="#4990e2"
          />
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
                this.textInput.blur();
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

export default connect((state) => state.main)(ScanCodeScreen);
