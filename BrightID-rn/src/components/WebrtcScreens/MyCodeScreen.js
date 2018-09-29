// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import Spinner from 'react-native-spinkit';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import WebRTCLogic from './WebRTCLogic';
import { stringByteLength } from '../../utils/encoding';
import logging from '../../utils/logging';
import channelLogging from '../../utils/channelLogging';
import { ICE_SERVERS, handleRecievedMessage } from './actions';

import {
  update,
  OFFER,
  ANSWER,
  USERB,
  USERA,
  ICE_CANDIDATE,
  fetchArbiter,
  exchangeAvatar,
  createRTCId,
} from './signalApi';

import { socket } from './websockets';

import { resetWebrtc, setArbiter, setConnectAvatar } from '../../actions';

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
  publicKey: Uint8Array,
  rtcId: string,
  dispatch: Function,
  userAvatar: { uri: string },
  nameornym: string,
  trustScore: string,
  resetQr: Function,
  hangUp: Function,
  rtcOn: boolean,
  navigation: Function,
};

type State = {
  qrsvg: string,
};

class MyCodeScreen extends React.Component<Props, State> {
  state = {
    qrsvgd: '',
  };

  async componentDidMount() {
    try {
      const { dispatch } = this.props;
      // obtain rtcId from server
      const rtcId = await dispatch(createRTCId());
      // generate qrcode with rtc id
      this.genQrCode();
      //
    } catch (err) {
      // we should handle err here in case network is down
      console.log(err);
    }
  }

  genQrCode = () => {
    const { rtcId } = this.props;
    if (rtcId) {
      qrcode.toString(rtcId, (err, data) => {
        if (err) throw err;
        this.parseSVG(data);
      });
    }
  };

  parseSVG = (qrsvg) => {
    // qrcode gives us a string representation of an svg
    // we must extract the value of d from this string in order to use it
    // with react-native-svg
    //
    const dinx = qrsvg.lastIndexOf('d');
    const dpath = qrsvg.substr(dinx);
    const qrsvgd = dpath.match(/"([^"]+)"/g)[0].split('"')[1];
    this.setState({ qrsvgd });
  };

  renderQrCode = () => {
    // render qrcode or spinner while waiting
    if (this.state.qrsvgd) {
      return (
        <View style={styles.qrsvgContainer}>
          <Svg
            height="246"
            width="246"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 33 33"
            shape-rendering="crispEdges"
          >
            <Path fill="#fff" d="M0 0h33v33H0z" />
            <Path stroke="#000" d={this.state.qrsvgd} />
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

  // renderWebRTCLogic = () => {
  //   const { rtcId, rtcOn, hangUp, navigation } = this.props;
  //   if (rtcId && rtcOn) {
  //     return (
  //       <WebRTCLogic user="UserA" hangUp={hangUp} navigation={navigation} />
  //     );
  //   }
  // };

  render() {
    const { userAvatar, nameornym } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.myCodeInfoContainer}>
          <Text style={styles.myCodeInfoText}>
            To make a new connection, you will share your
          </Text>
          <Text style={styles.myCodeInfoText}>
            name, your photo, your trust score
          </Text>
        </View>
        <View style={styles.userAvatarContainer}>
          <Image
            source={userAvatar || require('../../static/default_avatar.jpg')}
            style={styles.userAvatar}
            resizeMode="cover"
            onError={(e) => {
              console.log(e.error);
            }}
            accessible={true}
            accessibilityLabel="user avatar image"
          />
          <Text style={styles.nameornym}>{nameornym}</Text>
        </View>

        {this.renderQrCode()}
        {/* {this.renderWebRTCLogic()} */}
        {/* <TextInput value={this.props.rtcId || 'RTC TOKEN'} editable={true} /> */}
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
  userAvatarContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  userAvatar: {
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
    minHeight: 284,
  },
});

export default connect((state) => state.main)(MyCodeScreen);
