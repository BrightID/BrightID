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
  update,
  ANSWER,
  ZETA,
  ICE_CANDIDATE,
  fetchArbiter,
  handleRecievedMessage,
} from './webrtc';

import { resetWebrtc } from '../../actions';
/**
 * My Code screen of BrightID
 * ==================================================================
 * displays a qrcode with rtcId url obtained from a signalling server
 * this component also establishes a RTCPeerConnection and data channel
 * when mounted - the RTC channel is initiated with rtcId credentials
 * when unmounted - the RTC connection is removed
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

class RtcAnswerScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'New Connection',
    headerRight: <View />,
  };

  constructor(props) {
    super(props);

    this.state = {
      connecting: true,
    };
    // set up initial webrtc connection vars
    this.connection = null;
    this.channel = null;
    this.socket = null;
    this.pollingId = null;
  }

  async componentDidMount() {
    // create RTCPeerConnection
    this.initiateWebrtc();
    // fetch arbiter, then set RTC remote / local description and update signaling server
    this.answerWebrtc();
  }

  async componentDidUpdate(prevProps) {
    // generate a new qrcode if the rtcId value changes
    const { arbiter } = this.props;

    // set ice candidate
    if (
      this.connection &&
      arbiter &&
      arbiter.ALPHA.ICE_CANDIDATE &&
      (arbiter.ALPHA.ICE_CANDIDATE.candidate !==
        prevProps.arbiter.ALPHA.ICE_CANDIDATE.candidate ||
        arbiter.ALPHA.ICE_CANDIDATE.sdpMLineIndex !==
          prevProps.arbiter.ALPHA.ICE_CANDIDATE.sdpMLineIndex ||
        arbiter.ALPHA.ICE_CANDIDATE.sdpMid !==
          prevProps.arbiter.ALPHA.ICE_CANDIDATE.sdpMid)
    ) {
      console.log('UserB:');
      console.log(arbiter.ALPHA.ICE_CANDIDATE);
      await this.connection.addIceCandidate(
        new RTCIceCandidate(arbiter.ALPHA.ICE_CANDIDATE),
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

    dispatch(resetWebrtc());
  }

  initiateWebrtc = () => {
    const { dispatch, arbiter } = this.props;
    // create webrtc instance after we have the arbiter
    this.connection = new RTCPeerConnection(null);
    logging(this.connection, 'UserB');
    // update arbiter when ice candidate is found
    this.connection.onicecandidate = this.updateIce;
    // create data channel
    this.connection.ondatachannel = this.handleDataChannel;
    // set remote description
    return 'connection started';
  };

  handleDataChannel = (e) => {
    const { dispatch } = this.props;
    if (e.channel) {
      this.channel = e.channel;
      this.channel.onopen = () => {
        console.log('user B channel opened');
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
        console.log(`user B recieved message ${e.data}`);
        dispatch(handleRecievedMessage(e.data));
      };
    }
  };

  answerWebrtc = async () => {
    const { dispatch } = this.props;
    // fetch arbiter prior to setting RTC description
    const arbiter = await dispatch(fetchArbiter());
    // poll signaling server for changes
    this.pollSignalServer();
    // set remote description
    if (this.connection && arbiter && arbiter.ALPHA.OFFER) {
      await this.connection.setRemoteDescription(
        new RTCSessionDescription(arbiter.ALPHA.OFFER),
      );
    }
    // set ice candidate
    if (this.connection && arbiter && arbiter.ALPHA.ICE_CANDIDATE) {
      await this.connection.addIceCandidate(
        new RTCIceCandidate(arbiter.ALPHA.ICE_CANDIDATE),
      );
    }
    // create answer
    const answer = await this.connection.createAnswer();
    // set local description
    await this.connection.setLocalDescription(answer);
    // update redux store
    await dispatch(update({ type: ANSWER, person: ZETA, value: answer }));
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
            person: ZETA,
            type: ICE_CANDIDATE,
            value: e.candidate,
          }),
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>Exchanging info...</Text>
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

export default connect((state) => state.main)(RtcAnswerScreen);
