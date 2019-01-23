// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import { parseString } from 'xml2js';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
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

type Props = {
  dispatch: dispatch,
  photo: { filename: string },
  name: string,
  navigation: () => null,
  connectQrData: {
    qrString: string,
  },
};

type State = {
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

class MyCodeScreen extends React.Component<Props, State> {
  connectionExpired: TimeoutID;

  socket: { close: () => null };

  state = {
    qrsvg: '',
  };

  componentDidMount() {
    // After 2 minutes, connection attempts expire on the server.
    //  Let users start the connection over after one minute so there will be
    //  time for the other user to connect.
    this.connectionExpired = setTimeout(this.navigateToHome, 60000);
    emitter.on('connectDataReady', this.navigateToPreview);
    const { dispatch } = this.props;
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

  renderQrCode = () => {
    // render qrcode or spinner while waiting
    const { qrsvg } = this.state;
    if (qrsvg) {
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
    const { photo, name } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.half}>
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
                uri: `file://${RNFS.DocumentDirectoryPath}/photos/${
                  photo.filename
                }`,
              }}
              style={styles.photo}
              resizeMode="cover"
              onError={(e) => {
                console.log(e.error);
              }}
              accessible={true}
              accessibilityLabel="user photo"
            />
            <Text style={styles.name}>{name}</Text>
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
});

export default connect((state) => state.main)(MyCodeScreen);
