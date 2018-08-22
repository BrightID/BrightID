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
  PUBLIC_KEY,
  ICE_SERVERS,
  fetchArbiter,
  handleRecievedMessage,
  createKeypair,
} from './webrtc';

import { resetWebrtc, setConnectTimestamp } from '../../actions';
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
    // try {
    //   const { dispatch } = this.props;
    // generate box keypair

    // const { publicKey } = await dispatch(createKeypair());
    // // update arbiter with keypair
    // await dispatch(
    //   update({
    //     type: PUBLIC_KEY,
    //     person: ZETA,
    //     value: publicKey,
    //   }),
    // );
    // create RTCPeerConnection
    this.initiateWebrtc();
    // fetch arbiter, then set RTC remote / local description and update signaling server
    this.answerWebrtc();
    // } catch (err) {
    // we should handle err here in case network is down or something
    //   console.log(err);
    // }
  }

  async componentDidUpdate(prevProps) {
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
    console.log('did update');
    // update ice candidate
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

    dispatch(resetWebrtc());
  }

  initiateWebrtc = () => {
    // create webrtc instance after we have the arbiter
    this.connection = new RTCPeerConnection(ICE_SERVERS);
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

  answerWebrtc = async () => {
    try {
      const { dispatch } = this.props;
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
      // we should attempt to restart webrtc here
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

        console.log(`
        timestamp byte length: ${stringByteLength(JSON.stringify(dataObj))}
        str length: ${JSON.stringify(dataObj).length}
        `);
        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ timestamp }));
      }
      // send trust score
      if (trustScore) {
        let dataObj = { trustScore };

        console.log(`
        trustScore byte length: ${stringByteLength(JSON.stringify(dataObj))}
        str length: ${JSON.stringify(dataObj).length}
        `);
        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ trustScore }));
      }
      // send nameornym
      if (nameornym) {
        let dataObj = { nameornym };

        console.log(`
        nameornym byte length: ${stringByteLength(JSON.stringify(dataObj))}
        str length: ${JSON.stringify(dataObj).length}
        `);
        // webrtc helper function for sending messages
        this.channel.send(JSON.stringify({ nameornym }));
      }
      // send public key
      if (publicKey) {
        let dataObj = { publicKey };

        console.log(`
        publicKey byte length: ${stringByteLength(JSON.stringify(dataObj))}
        str length: ${JSON.stringify(dataObj).length}
        `);
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
        // this.count = 1;
        console.log(e.candidate);
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
