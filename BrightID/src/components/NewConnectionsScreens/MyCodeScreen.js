// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import { parseString } from 'xml2js';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import { genQrData } from './actions/genQrData';
import { encryptAndUploadLocalData } from './actions/encryptData';
import { setUpWs, closeWs } from './actions/websocket';
import emitter from '../../emitter';
import { removeConnectQrData } from '../../actions';

/**
 * My Code screen of BrightID
 *
 * USERA represents this user
 * ==================================================================
 * displays a qrcode with rtcId url obtained from a signalling server
 * this component also establishes a RTCPeerConnection and data channel
 * when mounted - the RTC channel is initiated with rtcId credentials already existing
 * when unmounted - the RTC connection is removed along with all redux data associated with creating a connection
 *
 */

type Props = {
  dispatch: dispatch,
  avatar: { uri: string },
  nameornym: string,
  navigation: () => null,
  connectQrData: {
    qrString: string,
  },
};

type State = {
  qrsvg: {
    svg: {
      $: {
        viewBox: string,
      },
    },
  },
};

class MyCodeScreen extends React.Component<Props, State> {
  connectionExpired: TimeoutID;

  socket: { close: () => null };

  state = {
    qrsvg: '',
  };

  componentDidMount() {
    // After 1 minute, connection attempts expire on the server.
    //  Let users start the connection over.
    this.connectionExpired = setTimeout(this.navigateToHome, 60000);
    emitter.on('connectDataReady', this.navigateToPreview);
    const { dispatch } = this.props;
    dispatch(removeConnectQrData());
    dispatch(genQrData()).then(() => {
      this.genQrCode();
      this.socket = dispatch(setUpWs());
      setTimeout(() => dispatch(encryptAndUploadLocalData()));
    });
  }

  componentWillUnmount() {
    clearTimeout(this.connectionExpired);
    emitter.off('connectDataReady', this.navigateToPreview);
    this.socket.close();
  }

  navigateToPreview = () => {
    this.props.navigation.navigate('PreviewConnection');
  };

  navigateToHome = () => {
    this.props.navigation.navigate('Home');
  };

  genQrCode = () => {
    const {
      connectQrData: { qrString },
    } = this.props;
    qrcode.toString(qrString, this.handleQrString);
  };

  handleQrString = (err, qr) => {
    if (err) return console.log(err);
    parseString(qr, this.parseQrString);
  };

  parseQrString = (err, qrsvg) => {
    if (err) return console.log(err);
    this.setState({ qrsvg });
  };

  renderQrCode = () => {
    // render qrcode or spinner while waiting
    const { qrsvg } = this.state;
    if (qrsvg) {
      console.log(qrsvg);
      return (
        <View style={styles.qrsvgContainer}>
          <Svg
            height="212"
            width="212"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={path(['svg', '$', 'viewBox'], qrsvg)}
            shape-rendering="crispEdges"
          >
            <Path fill="#fff" d={path(['svg', 'path', '0', '$', 'd'], qrsvg)} />
            <Path
              stroke="#000"
              d={path(['svg', 'path', '1', '$', 'd'], qrsvg)}
            />
          </Svg>
        </View>
      );
    } else {
      return (
        <View style={styles.qrsvgContainer}>
          <Spinner
            style={styles.spinner}
            isVisible={true}
            size={47}
            type="9CubeGrid"
            color="#4990e2"
          />
        </View>
      );
    }
  };

  render() {
    const { avatar, nameornym } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.half}>
          <View style={styles.myCodeInfoContainer}>
            <Text style={styles.myCodeInfoText}>
              To make a new connection, you will share your
            </Text>
            <Text style={styles.myCodeInfoText}>
              name, your photo, your trust score
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            <Image
              source={avatar || require('../../static/default_avatar.jpg')}
              style={styles.avatar}
              resizeMode="cover"
              onError={(e) => {
                console.log(e.error);
              }}
              accessible={true}
              accessibilityLabel="user avatar image"
            />
            <Text style={styles.nameornym}>{nameornym}</Text>
          </View>
        </View>
        <View style={styles.half}>{this.renderQrCode()}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  half: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myCodeInfoContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 36,
  },
  myCodeInfoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#4a4a4a',
  },
  avatarContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  avatar: {
    width: 102,
    height: 102,
    borderRadius: 51,
  },
  nameornym: {
    fontFamily: 'ApexNew-Book',
    marginTop: 12,
    fontSize: 20,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.32)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  qrsvgContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default connect((state) => state.main)(MyCodeScreen);
