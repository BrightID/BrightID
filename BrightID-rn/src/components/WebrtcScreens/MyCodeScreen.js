// @flow

import * as React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
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
      // );3
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
    this.connection = new RTCPeerConnection(null);
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
    const dinx = qrsvg.lastIndexOf('d');
    const dpath = qrsvg.substr(dinx);
    const qrsvgd = dpath.match(/"([^"]+)"/g)[0].split('"')[1];
    this.setState({ qrsvgd });
  };

  render() {
    return (
      <View style={styles.container}>
        <TextInput value={this.props.rtcId || 'RTC TOKEN'} editable={true} />
        <Svg height="150" width="150" viewBox="0 0 29 29">
          <Path fill="#fff" d="M0 0h29v29H0z" />
          <Path stroke="#000" d={this.state.qrsvgd} />
        </Svg>
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
});

export default connect((state) => state.main)(MyCodeScreen);
