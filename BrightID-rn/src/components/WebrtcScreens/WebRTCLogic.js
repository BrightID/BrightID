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
import logging from '../../utils/logging';
import channelLogging from '../../utils/channelLogging';
import { ICE_SERVERS, handleRecievedMessage } from './webrtc';
import {
  update,
  OFFER,
  ANSWER,
  USERB,
  USERA,
  ICE_CANDIDATE,
  fetchArbiter,
  exchangeAvatar,
} from './signalApi';

import { socket } from './websockets';

import {
  resetWebrtc,
  setConnectTimestamp,
  setArbiter,
  setConnectAvatar,
  setPreview,
} from '../../actions';
/**
 * RTC Ansewr Screen of BrightID
 *
 * USERB represents this user
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
  arbiter: { USERA: {}, USERB: {} },
  connectTimestamp: number,
  connectPublicKey: Uint8Array,
  connectNameornym: string,
  connectTrustScore: string,
  connectAvatar: string,
  connectRecievedTimestamp: boolean,
  connectRecievedTrustScore: boolean,
  connectRecievedPublicKey: boolean,
  connectRecievedNameornym: boolean,
  connectRecievedAvatar: boolean,
  navigation: { goBack: Function, navigate: (string) => null },
  user: String,
  hangUp: Function,
};

class WebRTCLogic extends React.Component<Props> {
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
    this.done = false;
    this.iceCount = 0;
    this.sucount = 0;
  }

  componentDidMount() {
    const { user } = this.props;
    if (user === 'UserA') {
      this.initiateWebrtcA();
    } else if (user === 'UserB') {
      this.initiateWebrtcB();
    }
    // initiate websocket
    this.initiateWebSocket();
  }

  componentDidUpdate(prevProps) {
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
      navigation,
      dispatch,
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
      connectRecievedPublicKey &&
      connectRecievedNameornym &&
      connectRecievedTrustScore &&
      !this.done
    ) {
      // transfer connection props to preview
      dispatch(setPreview());
      // navigate to preview screen
      navigation.navigate('PreviewConnection');
      this.done = true;
    }
  }

  componentWillUnmount() {
    console.log('unmounting webrtc logic');
    const { dispatch } = this.props;
    // close and remove webrtc connection
    if (this.connection) {
      this.connection.close();
    }
    // close data channel and remove
    if (this.channel) {
      this.channel.close();
    }
    // disconnect and remove socket
    if (this.socket) {
      this.socket.disconnect();
    }

    dispatch(resetWebrtc());
  }

  setIceCandidate = async (candidate) => {
    try {
      // set ice candidate
      if (this.connection && candidate) {
        await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      // error setting ice candidate?
      console.log(err);
    }
  };

  setRemoteDescription = async (arbiter) => {
    // set remote description
    try {
      if (
        this.connection &&
        arbiter &&
        arbiter.USERB.ANSWER &&
        arbiter.USERB.ANSWER.sdp !== this.connection.remoteDescription.sdp
      ) {
        await this.connection.setRemoteDescription(
          new RTCSessionDescription(arbiter.USERB.ANSWER),
        );
      }
    } catch (Err) {
      console.log(Err);
    }
  };

  initiateWebrtcA = async () => {
    try {
      const { dispatch } = this.props;
      // create webrtc instance
      this.connection = new RTCPeerConnection(ICE_SERVERS);
      // logging(this.connection, 'UserA');
      // create data channel
      this.channel = this.connection.createDataChannel('connect');
      this.addConnectionHandlers();
      // handle channel events
      this.handleDataChannel();
      // create offer and set local connection
      let offer = await this.connection.createOffer();
      if (!offer) offer = await this.connection.createOffer();
      if (!offer) offer = await this.connection.createOffer();
      await this.connection.setLocalDescription(offer);
      // update signal server
      await dispatch(update({ type: OFFER, person: USERA, value: offer }));
    } catch (err) {
      console.log(err);
    }
  };

  initiateWebrtcB = async () => {
    try {
      const { dispatch, user } = this.props;
      // fetch arbiter prior to initiating webrtc
      const arbiter = await dispatch(fetchArbiter());

      if (
        arbiter.error === "arbiter doesn't exist" ||
        arbiter.msg === 'error'
      ) {
        this.handleError();
        return;
      }
      // create webrtc instance after we have the arbiter
      this.connection = new RTCPeerConnection(ICE_SERVERS);

      logging(this.connection, user);

      this.addConnectionHandlers();

      // set remote description
      if (this.connection && arbiter && arbiter.USERA && arbiter.USERA.OFFER) {
        await this.connection.setRemoteDescription(
          new RTCSessionDescription(arbiter.USERA.OFFER),
        );
      }
      if (this.connection.remoteDescription) {
        // create answer
        let answer = await this.connection.createAnswer();
        if (!answer) answer = await this.connection.createAnswer();
        if (!answer) answer = await this.connection.createAnswer();
        // set local description
        await this.connection.setLocalDescription(answer);

        // update signaling server
        await dispatch(update({ type: ANSWER, person: USERB, value: answer }));
      }
    } catch (err) {
      // we should attempt to restart webrtc here
      console.log(err);
    }
  };

  addConnectionHandlers = () => {
    // SOS if this.connection is null
    if (this.connection) {
      this.connection.onicecandidate = this.updateIce;
      this.connection.oniceconnectionstatechange = this.handleICEConnectionStateChange;
      this.connection.onicegatheringstatechange = this.handleICEGatheringStateChange;
      this.connection.onsignalingstatechange = this.handleSignalingStateChange;
      this.connection.ondatachannel = this.handleDataChannel;
    }
  };

  initiateWebSocket = () => {
    // fetch initial rtc id from signaling server
    const { dispatch, rtcId, user } = this.props;
    // join websocket room
    this.socket = socket();
    this.socket.emit('join', rtcId);
    // subscribe to update event
    this.socket.on('update', (arbiter) => {
      // update redux store
      dispatch(setArbiter(arbiter));
      if (user === 'UserA') this.setRemoteDescription(arbiter);
    });
    // update ice candidate
    this.socket.on('new-ice-candidate', ({ candidate, person }) => {
      // console.log(`new ice candidate ${candidate}`);
      if (
        (person === USERA && user === 'UserB') ||
        (person === USERB && user === 'UserA')
      )
        this.setIceCandidate(candidate);
      // console.log(`socketio update ${this.sucount}`);
    });

    // update connect avatar
    this.socket.on('avatar', ({ avatar, person }) => {
      console.log(`avatar: ${avatar}`);
      if (person === USERA) {
        dispatch(setConnectAvatar(avatar));
      }
    });
  };

  handleDataChannel = (e) => {
    const { dispatch, user } = this.props;
    if (e && e.channel && user === 'UserB') {
      // create channel if this is data channel event
      this.channel = e.channel;
    }
    channelLogging(this.channel);
    // send user data when channel opens
    this.channel.onopen = () => {
      console.log('channel opened');
      // send public key, avatar, nameornym, and trustscore (and timestamp if UserB because they are the last one to initiate webrtc)
      this.sendUserData();
    };
    // do nothing when channel closes... yet
    this.channel.onclose = () => {
      console.log('channel closed');
    };
    /**
     * recieve webrtc messages here
     * pass data along to action creator in ../actions/webrtc
     */
    this.channel.onmessage = (e) => {
      // handle recieved message
      dispatch(handleRecievedMessage(e.data, this.channel));
    };
  };

  sendUserData = () => {
    // create timestamp then send data individually
    if (this.channel) {
      const {
        dispatch,
        trustScore,
        nameornym,
        userAvatar,
        publicKey,
        user,
      } = this.props;

      if (user === 'UserB') {
        /**
         * SEND TIMESTAMP
         */
        const timestamp = Date.now();
        this.channel.send(JSON.stringify({ timestamp }));
        dispatch(setConnectTimestamp(timestamp));
      }
      // send trust score
      if (trustScore) {
        this.channel.send(JSON.stringify({ trustScore }));
      }
      // send nameornym
      if (nameornym) {
        this.channel.send(JSON.stringify({ nameornym }));
      }
      // send public key
      if (publicKey) {
        this.channel.send(JSON.stringify({ publicKey }));
      }
      // send user avatar
      if (userAvatar) {
        console.log('here');
        // send avatar to signaling server
        // payload too big!!
        // dispatch(exchangeAvatar({ person: USERB }));
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

  updateIce = async (e) => {
    // many ice candidates are emited
    // how should we handle this???
    try {
      const { dispatch, user } = this.props;
      if (e.candidate) {
        /**
         * update the signaling server dispatcher with ice candidate info
         * @param person = USERA || USERB
         * @param type = ICE_CANDIDATE
         * @param value = e.candidate
         */

        dispatch(
          update({
            person: user === 'UserA' ? USERA : USERB,
            type: ICE_CANDIDATE,
            value: e.candidate,
          }),
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  handleICEConnectionStateChange = () => {
    const { hangUp } = this.props;
    if (this.connection)
      console.log(
        `ice connection state: ${this.connection.iceConnectionState}`,
      );
    if (
      this.connection &&
      (this.connection.iceConnectionState === 'closed' ||
        this.connection.iceConnectionState === 'failed' ||
        this.connection.iceConnectionState === 'disconnected') &&
      !this.done
    ) {
      // hang up call
      hangUp();
    }
  };

  handleICEGatheringStateChange = () => {
    if (this.connection) {
      console.log(`ice gathering state: `, this.connection.iceGatheringState);
    }
  };

  handleSignalingStateChange = () => {
    const { hangUp } = this.props;
    if (
      this.connection &&
      this.connection.signalingState === 'closed' &&
      !this.done
    ) {
      // hang up call
      hangUp();
    }
  };

  handleError = () => {
    const { hangUp } = this.props;
    console.log('rtc value incorrect');
    // hang up

    hangUp();
  };

  render() {
    return <View />;
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

export default connect((state) => state.main)(WebRTCLogic);
