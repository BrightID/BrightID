// @flow

import * as React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
// import Permissions from 'react-native-permissions'
import { RNCamera } from 'react-native-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { generateMessage } from './exchange';

/**
 * Connection screen of BrightID
 */

type Props = {
  dispatch: Function,
};

type State = {
  hasCameraPermission: boolean,
  type: string,
};

class ScanCodeScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Scan QR code',
    headerRight: <View />,
  };

  state = {
    hasCameraPermission: '',
    dataFound: false,
  };

  componentDidMount() {
    // Permissions.check('photo').then((response) => {
    //   // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
    //   this.setState({ hasCameraPermission: response });
    // });
  }

  handleBarCodeRead = ({ type, data }) => {
    // TODO - CHANGE THIS
    const { dispatch } = this.props;

    if (!this.state.dataFound) {
      // Alert.alert(data);
      //
      console.warn(data);
      dispatch(generateMessage(data));
    }
    // only scan code once
    // this is a hack, TODO: CHANGE THIS
    this.setState({ qrData: data, dataFound: true });
  };

  render() {
    const { hasCameraPermission } = this.state;
    // conditionally return different views
    // if no camera permission.. render error screen
    // TODO: ask user for camera permissions
    if (hasCameraPermission === null) {
      return (
        <View style={styles.container}>
          <Text>Requesting for camera permission</Text>
        </View>
      );
    }

    if (hasCameraPermission === false) {
      return (
        <View style={styles.container}>
          <Text>No access to camera</Text>
        </View>
      );
    }
    // else
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '100%',
  },
  preview: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect((state) => state.main)(ScanCodeScreen);
