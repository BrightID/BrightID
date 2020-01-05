// @flow

import * as React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import { parseString } from 'xml2js';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { genQrData } from './actions/genQrData';
import { encryptAndUploadLocalData } from './actions/encryptData';
import { setUpWs } from './actions/websocket';
import emitter from '../../emitter';
import { removeConnectQrData } from '../../actions';

/**
 * My Code screen of BrightID
 *
 * USERA represents this user
 * ==================================================================
 * displays a qrcode
 *
 */

type State = {
  copied: boolean,
  qrsvg:
    | string
    | {
        svg: {
          $: {
            viewBox: string,
          },
        },
      },
};

const COPIED_TIMEOUT = 500;

export class MyCodeScreen extends React.Component<Props, State> {
  connectionExpired: TimeoutID;

  socket: { close: () => null };

  state = {
    qrsvg: '',
    copied: false,
  };

  componentDidMount() {
    // After 2 minutes, connection attempts expire on the server.
    //  Let users start the connection over after one minute so there will be
    //  time for the other user to connect.
    const { dispatch } = this.props;
    this.connectionExpired = setTimeout(this.navigateToHome, 60000);
    emitter.on('connectDataReady', this.navigateToPreview);
    dispatch(removeConnectQrData());
    dispatch(genQrData()).then(() => {
      this.genQrCode();
      this.socket = dispatch(setUpWs());
      dispatch(encryptAndUploadLocalData());
    });
  }

  componentWillUnmount() {
    clearTimeout(this.connectionExpired);
    emitter.off('connectDataReady', this.navigateToPreview);
    if (this.socket) this.socket.close();
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

  copyQr = () => {
    const {
      connectQrData: { qrString },
    } = this.props;
    Clipboard.setString(qrString);
    this.setState({ copied: true }, () =>
      setTimeout(() => this.setState({ copied: false }), COPIED_TIMEOUT),
    );
  };

  renderCopyQr = () => (
    <TouchableOpacity style={styles.copyContainer} onPress={this.copyQr}>
      <Material
        size={24}
        name="content-copy"
        color="#333"
        style={{ width: 24, height: 24 }}
      />
      <Text style={styles.copyText}> Copy</Text>
    </TouchableOpacity>
  );

  renderSpinner = () => (
    <View style={styles.qrsvgContainer}>
      <Spinner
        // style={styles.spinner}
        isVisible={true}
        size={47}
        type="9CubeGrid"
        color="#4990e2"
      />
    </View>
  );

  renderQrCode = () => (
    <View style={[styles.qrsvgContainer]}>
      <Svg
        height="212"
        width="212"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={path(['svg', '$', 'viewBox'], this.state.qrsvg)}
        shape-rendering="crispEdges"
      >
        <Path
          fill={this.state.copied ? 'lightblue' : '#fff'}
          d={path(['svg', 'path', '0', '$', 'd'], this.state.qrsvg)}
        />
        <Path
          stroke="#000"
          d={path(['svg', 'path', '1', '$', 'd'], this.state.qrsvg)}
        />
      </Svg>
    </View>
  );

  render() {
    const { photo, name } = this.props;
    const { qrsvg } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.topHalf}>
          <View style={styles.myCodeInfoContainer}>
            <Text style={styles.myCodeInfoText}>
              To make a new connection, you will share your
            </Text>
            <Text style={styles.myCodeInfoText}>
              name, your photo, your score
            </Text>
          </View>
          <View style={styles.photoContainer}>
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/photos/${photo.filename}`,
              }}
              style={styles.photo}
              resizeMode="cover"
              onError={(e) => {
                console.log(e);
              }}
              accessible={true}
              accessibilityLabel="user photo"
            />
            <Text style={styles.name}>{name}</Text>
          </View>
        </View>
        <View style={styles.bottomHalf}>
          {qrsvg ? this.renderQrCode() : this.renderSpinner()}
          {qrsvg ? this.renderCopyQr() : <View />}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  topHalf: {
    height: '45%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomHalf: {
    height: '55%',
    width: '100%',
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
  photoContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  photo: {
    width: 102,
    height: 102,
    borderRadius: 51,
  },
  name: {
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
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 25,
    minWidth: 100,
  },
  copyText: {
    color: '#333',
    fontFamily: 'ApexNew-Book',
  },
});

export default connect((state) => state)(MyCodeScreen);
