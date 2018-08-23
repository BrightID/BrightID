// @flow

import * as React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
import Spinner from 'react-native-spinkit';
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
  PUBLIC_KEY,
  ICE_SERVERS,
  fetchArbiter,
  handleRecievedMessage,
  createKeypair,
} from './webrtc';

import { socket } from './websockets';

import { resetWebrtc, setConnectTimestamp, setArbiter } from '../../actions';
/**
 * RTC Ansewr Screen of BrightID
 *
 * ZETA represents this user
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
  rtcId: string,
  navigation: { goBack: Function, navigate: (string) => null },
};

class RtcAnswerScreen extends React.Component<Props> {
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
    this.done = false;
  }

  componentDidMount() {
    try {
      // create RTCPeerConnection
      this.initiateWebrtc();
      // fetch arbiter, then set RTC remote / local description and update signaling server
      // this.answerWebrtc();
      // initiate websocket
      this.initiateWebSocket();
    } catch (err) {
      // we should handle err here in case network is down or something
      console.log(err);
    }
  }

  componentDidUpdate(prevProps) {
    try {
      const {
        arbiter,
        connectTimestamp,
        connectPublicKey,
        connectNameornym,
        connectTrustScore,
        connectRecievedTimestamp,
        connectRecievedTrustScore,
        connectRecievedPublicKey,
        connectRecievedNameornym,
        connectRecievedAvatar,
        connectAvatar,
        connect,
        navigation,
      } = this.props;
      /**
       * This logic determines whether all webrtc data has been
       * successfully transferred and we are able to create a new
       * connection
       *
       * currently this is determined by whether the client recieved our timestamp, public key, trust score, and nameornym - and whether we recieved their nameornym and public key
       *
       * react navigation might not unmount the component, it
       * hides components during the transitions between screens
       *
       * TODO - handle logic for re attempting to send user data
       * this will become more important if the avatar logic is implemented
       */
      if (
        connectPublicKey &&
        connectNameornym &&
        connectTimestamp &&
        connectRecievedTimestamp &&
        connectRecievedPublicKey &&
        connectRecievedNameornym &&
        connectRecievedTrustScore &&
        !this.done
      ) {
        // navigate to preview screen
        navigation.navigate('PreviewConnection');
        this.done = true;
      }
    } catch (err) {
      // do we have an issue setting an ice candidate?
      console.log(err);
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

  setIceCandidate = async (arbiter) => {
    // many ice candidates are emited
    // how should we handle this???
    try {
      // update ice candidate
      if (this.connection && arbiter && arbiter.ALPHA.ICE_CANDIDATE) {
        // set ice candidate
        // console.log(
        //   `setting ice candidate: ${arbiter.ALPHA.ICE_CANDIDATE.candidate}`,
        // );

        await this.connection.addIceCandidate(
          new RTCIceCandidate(arbiter.ALPHA.ICE_CANDIDATE),
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  initiateWebrtc = async () => {
    try {
      const { dispatch } = this.props;
      // fetch arbiter prior to initiating webrtc
      const arbiter = await dispatch(fetchArbiter());

      // create webrtc instance after we have the arbiter
      this.connection = new RTCPeerConnection(ICE_SERVERS);
      // window.cb = this.connection;
      logging(this.connection, 'UserB');
      // update arbiter when ice candidate is found
      this.connection.onicecandidate = this.updateIce;
      // create data channel
      this.connection.ondatachannel = this.handleDataChannel;
      // if arbiter doesn't exist return to the previous screen
      if (
        arbiter.error === "arbiter doesn't exist" ||
        arbiter.msg === 'error'
      ) {
        this.handleError();
      }
      // set remote description
      if (this.connection && arbiter && arbiter.ALPHA && arbiter.ALPHA.OFFER) {
        await this.connection.setRemoteDescription(
          new RTCSessionDescription(arbiter.ALPHA.OFFER),
        );
      }
      // create answer
      let answer = await this.connection.createAnswer();
      if (!answer) answer = await this.connection.createAnswer();
      if (!answer) answer = await this.connection.createAnswer();
      // set local description
      await this.connection.setLocalDescription(answer);
      // update redux store
      await dispatch(update({ type: ANSWER, person: ZETA, value: answer }));

      // set an ice candidate
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
    } catch (err) {
      // we should attempt to restart webrtc here
      console.log(err);
    }
  };

  initiateWebSocket = () => {
    // fetch initial rtc id from signaling server
    const { dispatch, rtcId } = this.props;
    // join websocket room
    this.socket = socket();
    this.socket.emit('join', rtcId);
    // subscribe to update event
    this.socket.on('update', (arbiter) => {
      // update redux store
      dispatch(setArbiter(arbiter));
      this.setIceCandidate(arbiter);
    });
  };

  handleDataChannel = (e) => {
    const { dispatch } = this.props;
    if (e.channel) {
      this.channel = e.channel;
      channelLogging(this.channel);
      // send user data when channel opens
      this.channel.onopen = () => {
        console.log('user B channel opened');
        // send public key, avatar, nameornym, and trustscore
        this.sendUserBData();
      };
      // do nothing when channel closes... yet
      this.channel.onclose = () => {
        console.log('user B channel closed');
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
        console.log(`on buffered amount low`);
        console.log(e);
      };
      this.channel.onerror = (e) => {
        console.log(`channel error`);
        console.log(e);
      };
    }
  };

  answerWebrtc = async () => {};

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

        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ timestamp }));
      }
      // send trust score
      if (trustScore) {
        let dataObj = { trustScore };

        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ trustScore }));
      }
      // send nameornym
      if (nameornym) {
        let dataObj = { nameornym };

        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ nameornym }));
      }
      // send public key
      if (publicKey) {
        let dataObj = { publicKey };

        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ publicKey }));
      }
      // send user avatar
      if (userAvatar) {
        // console.log('has user avatar');
        // let dataObj = { avatar: userAvatar };
        // console.log(`
        // user Avatar byte length: ${stringByteLength(JSON.stringify(dataObj))}
        // str length: ${JSON.stringify(dataObj).length}
        // `);
        // // webrtc helper function for sending messages
        // this.channel.send(JSON.stringify({ avatar: userAvatar }));
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

  updateIce = async (e) => {
    // many ice candidates are emited
    // how should we handle this???
    try {
      const { dispatch } = this.props;
      if (e.candidate && !this.count) {
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

  // pollSignalServer = () => {
  //   const { dispatch } = this.props;
  //   // poll signalling server
  //   this.pollingId = setInterval(() => {
  //     dispatch(fetchArbiter());
  //   }, 1000);
  // };

  // stopPollingServer = () => {
  //   // clear polling interval
  //   if (this.pollingId) {
  //     clearInterval(this.pollingId);
  //     this.pollingId = null;
  //   }
  // };

  render() {
    return (
      <View style={styles.container}>
        <Spinner
          style={styles.spinner}
          isVisible={true}
          size={41}
          type="9CubeGrid"
          color="#4990e2"
        />
        <Text>Exchanging info...</Text>
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
    justifyContent: 'center',
    flexDirection: 'column',
  },
  spinner: {
    margin: 10,
  },
});

export default connect((state) => state.main)(RtcAnswerScreen);
