// @flow

import * as React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
// import { generateMessage } from '../actions/exchange';
import logging from '../../utils/logging';
import { stringByteLength } from '../../utils/encoding';
import channelLogging from './channelLogging';
import {
  update,
  ANSWER,
  ZETA,
  ICE_CANDIDATE,
  fetchArbiter,
  handleRecievedMessage,
  sendMessage,
  createKeypair,
} from './webrtc';

import { resetWebrtc, setConnectTimestamp } from '../../actions';
/**
 * My Code screen of BrightID
 * ==================================================================
 * exchanges user data
 * this component also establishes a RTCPeerConnection and data channel
 * when mounted - the RTC channel is initiated with rtcId credentials
 * when unmounted - the RTC connection is removed
 *
 */

type Props = {
  publicKey: Uint8Array,
  trustScore: string,
  userAvatar: string,
  nameornym: string,
  dispatch: Function,
  navigation: { goBack: Function, navigate: (string) => null },
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

    // set up initial webrtc connection vars
    this.connection = null;
    this.channel = null;
    this.socket = null;
    this.pollingId = null;
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    // generate box keypair
    await dispatch(createKeypair());
    // create RTCPeerConnection
    this.initiateWebrtc();
    // fetch arbiter, then set RTC remote / local description and update signaling server
    this.answerWebrtc();
  }

  shouldComponentUpdate(nextProps) {
    const {
      arbiter,
      connectTimestamp,
      connectPublicKey,
      connectNameornym,
      navigation,
    } = nextProps;

    // if we have all of the second users data, proceed to the next screen
    // avatar is optionally since we aren't setting them universally yet
    if (connectTimestamp && connectPublicKey && connectNameornym) {
      // navigation.navigate()
    }

    return true;
  }

  async componentDidUpdate(prevProps) {
    const { arbiter } = this.props;
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
      // set ice candidate
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
    // create webrtc instance after we have the arbiter
    this.connection = new RTCPeerConnection(null);
    logging(this.connection, 'UserB');
    // update arbiter when ice candidate is found
    this.connection.onicecandidate = this.updateIce;
    // create data channel
    this.connection.ondatachannel = this.handleDataChannel;
  };

  handleDataChannel = (e) => {
    const { dispatch } = this.props;
    if (e.channel) {
      this.channel = e.channel;
      channelLogging(this.channel);
      // send user data when channel opens
      this.channel.onopen = () => {
        console.warn('user B channel opened');
        // send public key, avatar, nameornym, and trustscore
        this.sendUserBData();
      };
      // do nothing when channel closes... yet
      this.channel.onclose = () => {
        console.warn('user B channel closed');
      };
      /**
       * recieve webrtc messages here
       * pass data along to action creator in ../actions/webrtc
       */
      this.channel.onmessage = (e) => {
        // handle recieved message
        dispatch(handleRecievedMessage(e.data, this.channel));
      };
      this.channel.onbufferedamountlow = (e) => {
        console.warn(`on buffered amount low`);
        console.warn(e);
      };
      this.channel.onerror = (e) => {
        console.warn(`channel error`);
        console.warn(e);
      };
    }
  };

  answerWebrtc = async () => {
    try {
      const { dispatch, navigation } = this.props;
      // fetch arbiter prior to setting RTC description
      const arbiter = await dispatch(fetchArbiter());
      // if arbiter doesn't exist return to the previous screen
      if (
        arbiter.error === "arbiter doesn't exist" ||
        arbiter.msg === 'error'
      ) {
        this.handleError();
      }
      // poll signaling server for changes
      this.pollSignalServer();
      // set remote description
      if (this.connection && arbiter && arbiter.ALPHA && arbiter.ALPHA.OFFER) {
        await this.connection.setRemoteDescription(
          new RTCSessionDescription(arbiter.ALPHA.OFFER),
        );
      }
      // set ice candidate
      if (
        this.connection &&
        arbiter &&
        arbiter.ALPHA &&
        arbiter.ALPHA.ICE_CANDIDATE
      ) {
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
    } catch (err) {
      console.log(err);
    }
  };

  sendUserBData = () => {
    // create timestamp then send data individually
    if (this.channel) {
      const {
        dispatch,
        trustScore,
        nameornym,
        userAvatar,
        publicKey,
      } = this.props;

      /**
       * CREATE TIMESTAMP
       */

      const timestamp = Date.now();
      // save timestamp into redux store
      dispatch(setConnectTimestamp(timestamp));

      // send time stamp
      if (timestamp) {
        let dataObj = { timestamp };

        console.warn(`
        timestamp byte length: ${stringByteLength(JSON.stringify(dataObj))}
        str length: ${JSON.stringify(dataObj).length}
        `);
        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ timestamp }));
      }
      // send trust score
      if (trustScore) {
        let dataObj = { trustScore };

        console.warn(`
        trustScore byte length: ${stringByteLength(JSON.stringify(dataObj))}
        str length: ${JSON.stringify(dataObj).length}
        `);
        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ trustScore }));
      }
      // send nameornym
      if (nameornym) {
        let dataObj = { nameornym };

        console.warn(`
        nameornym byte length: ${stringByteLength(JSON.stringify(dataObj))}
        str length: ${JSON.stringify(dataObj).length}
        `);
        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ nameornym }));
      }
      // send public key
      if (publicKey) {
        let dataObj = { publicKey };

        console.warn(`
        publicKey byte length: ${stringByteLength(JSON.stringify(dataObj))}
        str length: ${JSON.stringify(dataObj).length}
        `);
        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ publicKey }));
      }
      // send user avatar
      if (userAvatar) {
        console.warn('has user avatar');
        let dataObj = { avatar: userAvatar };
        console.warn(`
        user Avatar byte length: ${stringByteLength(JSON.stringify(dataObj))}
        str length: ${JSON.stringify(dataObj).length}
        `);
        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ avatar: userAvatar }));
      }
    }
  };

  handleError = () => {
    const { navigation } = this.props;
    Alert.alert(
      'Please try again',
      'RtcId value is incorrect',
      [
        {
          text: 'OK',
          onPress: () => {
            // return to the previous screen
            navigation.goBack();
          },
        },
      ],
      { cancelable: false },
    );
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
