// @flow

import * as React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
// import Permissions from 'react-native-permissions'
import { RNCamera } from 'react-native-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { setRtcId } from '../../actions';

/**
 * Scan code screen of BrightID
 * ==================================================================
 * displays a react-native-camera view
 * after scanning qrcode - ab RTC channel is established with rtcId credentials
 * when unmounted - the RTC connection is removed
 *
 */

type Props = {
  dispatch: Function,
};

type State = {
  hasCameraPermission: boolean,
  type: string,
};

class ScanCodeScreen extends React.Component<Props, State> {
  state = {
    hasCameraPermission: '',
  };

  componentDidMount() {
    // Permissions.check('photo').then((response) => {
    //   // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
    //   this.setState({ hasCameraPermission: response });
    // });
  }

  handleBarCodeRead = ({ type, data }) => {
    // TODO - CHANGE THIS
    const { dispatch, navigation } = this.props;
    console.warn(`type: ${type}`);
    console.warn(`data: ${data}`);
    // set rtc id url into redux store
    if (data && data.length > 5 && data.length < 15) dispatch(setRtcId(data));

    // switch to RtcAnswerScreen
    navigation.navigate('RtcAnswer');
    // if (!this.state.dataFound) {
    //   // Alert.alert(data);
    //   //
    //   console.log(data);
    //   dispatch(generateMessage(data));
    // }
    // // only scan code once
    // // this is a hack, TODO: CHANGE THIS
    // this.setState({ qrData: data, dataFound: true });
  };

  render() {
    const { hasCameraPermission } = this.state;
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
    width: '100%',
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  preview: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect((state) => state.main)(ScanCodeScreen);
