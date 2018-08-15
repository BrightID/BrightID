// @flow

import * as React from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
// import Permissions from 'react-native-permissions'
import { RNCamera } from 'react-native-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { setRtcId } from '../../actions';

/**
 * Scan code screen of BrightID
 * ==================================================================
 * displays a react-native-camera view
 * after scanning qrcode - the rtc id is set
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
    rtcId: '',
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
    console.log(`type: ${type}`);
    console.log(`data: ${data}`);
    // set rtc id url into redux store
    if (data && data.length > 20 && data.length < 25) dispatch(setRtcId(data));

    // switch to RtcAnswerScreen after RTC ID is set
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
        <View style={styles.inputContainer}>
          <TextInput
            value={this.state.rtcId}
            onChangeText={(value) => {
              this.setState({ rtcId: value.trim() });
            }}
            style={styles.searchField}
            placeholder="Copy RtcId"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="name"
            underlineColorAndroid="transparent"
          />
          <Button
            title="submit rtc token"
            onPress={() => {
              const { rtcId } = this.state;
              this.handleBarCodeRead({ type: 'text-input', data: rtcId });
            }}
          />
        </View>
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
    // ...StyleSheet.absoluteFillObject,
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  inputContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 10,
  },
  searchField: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    marginTop: 3.1,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
    padding: 3.4,
    height: 23,
    minWidth: 200,
  },
});

export default connect((state) => state.main)(ScanCodeScreen);
