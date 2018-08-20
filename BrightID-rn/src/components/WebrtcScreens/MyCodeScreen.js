// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
// import { generateMessage } from '../actions/exchange';
import logging from '../../utils/logging';
import {
  createRTCId,
  update,
  OFFER,
  ALPHA,
  PUBLIC_KEY,
  ICE_CANDIDATE,
  ICE_SERVERS,
  fetchArbiter,
  handleRecievedMessage,
  createKeypair,
} from './webrtc';

import { resetWebrtc } from '../../actions';
/**
 * My Code screen of BrightID
 *
 * ALPHA represents this user
 * ==================================================================
 * displays a qrcode with rtcId url obtained from a signalling server
 * this component also establishes a RTCPeerConnection and data channel
 * when mounted - the RTC channel is initiated with rtcId credentials
 * when unmounted - the RTC connection is removed along with all redux data associated with creating a connection
 *
 */

type Props = {
  publicKey: Uint8Array,
  rtcId: string,
  dispatch: Function,
  userAvatar: { uri: string },
};

type State = {
  qrsvg: string,
};

class MyCodeScreen extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      qrsvgd: '',
      connecting: true,
    };
    // set up initial webrtc connection
    this.connection = null;
    this.channel = null;
    this.socket = null;
    this.pollingId = null;
  }

  async componentDidMount() {
    try {
      const { dispatch } = this.props;
      // obtain rtcId from server
      await dispatch(createRTCId());
      // generate box keypair
      // const { publicKey } = await dispatch(createKeypair());
      // // update arbiter with keypair
      // await dispatch(
      //   update({
      //     type: PUBLIC_KEY,
      //     person: ALPHA,
      //     value: publicKey,
      //   }),
      // );
      // generate qrcode with rtc id
      this.genQrCode();
      // initiate webrtc
      this.initiateWebrtc();
      // start polling server for remote desc and ice candidates
      this.pollSignalServer();
    } catch (err) {
      // we should handle err here in case network is down
      console.log(err);
    }
  }

  async componentDidUpdate(prevProps) {
    // generate a new qrcode if the rtcId value changes
    const { arbiter } = this.props;

    // set remote description
    if (
      this.connection &&
      arbiter &&
      arbiter.ZETA.ANSWER &&
      (arbiter.ZETA.ANSWER.sdp !== prevProps.arbiter.ZETA.ANSWER.sdp ||
        arbiter.ZETA.ANSWER.type !== prevProps.arbiter.ZETA.ANSWER.type)
    ) {
      await this.connection.setRemoteDescription(
        new RTCSessionDescription(arbiter.ZETA.ANSWER),
      );
    }
    // set ice candidate
    if (
      this.connection &&
      arbiter &&
      arbiter.ZETA.ICE_CANDIDATE &&
      (arbiter.ZETA.ICE_CANDIDATE.candidate !==
        prevProps.arbiter.ZETA.ICE_CANDIDATE.candidate ||
        arbiter.ZETA.ICE_CANDIDATE.sdpMLineIndex !==
          prevProps.arbiter.ZETA.ICE_CANDIDATE.sdpMLineIndex ||
        arbiter.ZETA.ICE_CANDIDATE.sdpMid !==
          prevProps.arbiter.ZETA.ICE_CANDIDATE.sdpMid)
    ) {
      console.log('UserA:');
      console.log(arbiter.ZETA.ICE_CANDIDATE);
      await this.connection.addIceCandidate(
        new RTCIceCandidate(arbiter.ZETA.ICE_CANDIDATE),
      );
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    this.stopPollingServer();
    // close and remove webrtc connection
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    // close data channel and remove
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    // disconnect and remove socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    // clear polling interval
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
    // look out for this prior to finishing webrtc code
    dispatch(resetWebrtc());
  }

  initiateWebrtc = async () => {
    const { dispatch } = this.props;
    // create webrtc instance
    console.log('creating w3ebrtc data channel');
    this.connection = new RTCPeerConnection(ICE_SERVERS);
    logging(this.connection, 'UserA');
    window.ca = this.connection;
    // handle ice
    this.connection.onicecandidate = this.updateIce;
    // create data channel
    this.channel = this.connection.createDataChannel('connect');
    // handle channel events
    this.updateChannel();
    // create offer and set local connection
    console.log('creating offer');
    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    // update redux store
    await dispatch(update({ type: OFFER, person: ALPHA, value: offer }));
  };

  pollSignalServer = () => {
    const { dispatch } = this.props;
    // poll signalling server
    this.pollingId = setInterval(() => {
      dispatch(fetchArbiter());
    }, 1000);
  };

  stopPollingServer = () => {
    // clear polling interval
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  };

  updateChannel = () => {
    const { dispatch } = this.props;
    if (this.channel) {
      this.channel.onopen = () => {
        console.log('user A channel opened');
        this.setState({
          connecting: false,
        });
      };
      this.channel.onclose = () => {
        console.log('user A channel closed');
      };
      /**
       * recieve webrtc messages here
       * pass data along to action creator in ../actions/webrtc
       */
      this.channel.onmessage = (e) => {
        console.log(`user A recieved message ${e.data}`);
        dispatch(handleRecievedMessage(e.data, this.channel));
      };
    }
  };

  updateIce = async (e) => {
    try {
      const { dispatch } = this.props;
      if (e.candidate) {
        /**
         * update the signaling server dispatcher with ice candidate info
         * @param person = ZETA
         * @param type = ICE_CANDIDATE
         * @param value = e.candidate
         */

        dispatch(
          update({
            person: ALPHA,
            type: ICE_CANDIDATE,
            value: e.candidate,
          }),
        );
      }
      console.log(e.candidate);
    } catch (err) {
      console.log(err);
    }
  };

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
    console.log(qrsvg);
    const dinx = qrsvg.lastIndexOf('d');
    const dpath = qrsvg.substr(dinx);
    const qrsvgd = dpath.match(/"([^"]+)"/g)[0].split('"')[1];
    this.setState({ qrsvgd });
    console.log(qrsvgd);
  };

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
            source={userAvatar}
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
        {/* <TextInput value={this.props.rtcId || 'RTC TOKEN'} editable={true} /> */}
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
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default connect((state) => state.main)(MyCodeScreen);
