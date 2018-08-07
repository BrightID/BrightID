// @flow

import React, { Component } from 'react';
// import nacl from 'tweetnacl';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import {
  createRTCId,
  update,
  OFFER,
  ALPHA,
  ICE_CANDIDATE,
  fetchDispatcher,
} from './actions/api';
import { resetStore, setUserADispatcher } from './actions';
import { socket } from './websockets';
import logging from './utils/logging';

type Props = {
  rtcId: string,
  dispatch: () => Promise,
  dispatcher: {},
};

class DisplayQR extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      qrcode: '',
    };
    // set up initial webrtc connection
    this.connection = null;
    this.channel = null;
    this.socket = null;
  }

  async componentDidMount() {
    // fetch initial rtc id from signaling server
    const { dispatch } = this.props;
    const rtcId = await dispatch(createRTCId());
    // generate qrcode with rtc id
    this.genQrCode();
    // initiate webrtc
    this.initiateWebrtc();
    // join websocket room
    this.socket = socket();
    this.socket.emit('join', rtcId);
    // subscribe to update event
    this.socket.on('update', (dispatcher) => {
      // update redux store
      console.log('socket io update User A');
      console.log(dispatcher);
      dispatch(setUserADispatcher(dispatcher));
    });
  }

  async componentDidUpdate(prevProps) {
    // generate a new qrcode if the rtcId value changes
    const { dispatcher } = this.props;

    // set remote description
    if (
      this.connection &&
      dispatcher &&
      dispatcher.ZETA.ANSWER &&
      (dispatcher.ZETA.ANSWER.sdp !== prevProps.dispatcher.ZETA.ANSWER.sdp ||
        dispatcher.ZETA.ANSWER.type !== prevProps.dispatcher.ZETA.ANSWER.type)
    ) {
      await this.connection.setRemoteDescription(
        new RTCSessionDescription(dispatcher.ZETA.ANSWER),
      );
    }
    // set ice candidate
    if (
      this.connection &&
      dispatcher &&
      dispatcher.ZETA.ICE_CANDIDATE &&
      (dispatcher.ZETA.ICE_CANDIDATE.candidate !==
        prevProps.dispatcher.ZETA.ICE_CANDIDATE.candidate ||
        dispatcher.ZETA.ICE_CANDIDATE.sdpMLineIndex !==
          prevProps.dispatcher.ZETA.ICE_CANDIDATE.sdpMLineIndex ||
        dispatcher.ZETA.ICE_CANDIDATE.sdpMid !==
          prevProps.dispatcher.ZETA.ICE_CANDIDATE.sdpMid)
    ) {
      console.log('UserA:');
      console.log(dispatcher.ZETA.ICE_CANDIDATE);
      await this.connection.addIceCandidate(
        new RTCIceCandidate(dispatcher.ZETA.ICE_CANDIDATE),
      );
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(resetStore());
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

  updateChannel = () => {
    if (this.channel) {
      this.channel.onopen = () => {
        console.log('user A channel opened');
      };
      this.channel.onclose = () => {
        console.log('user A channel closed');
      };
      this.channel.onmessage = (e) => {
        console.log(`user A recieved message ${e.data}`);
        console.log(e);
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
      console.warn(err);
    }
  };

  genQrCode = () => {
    const { rtcId } = this.props;
    if (rtcId) {
      qrcode.toString(rtcId, (err, data) => {
        if (err) throw err;
        this.setState({
          qrcode: data,
        });
      });
    }
  };

  render() {
    const { rtcId } = this.props;
    return (
      <div className="qrcode-screen">
        <div
          className="qrcode"
          dangerouslySetInnerHTML={{ __html: this.state.qrcode }}
        />
        {rtcId}
      </div>
    );
  }
}

export default connect((s) => s.userA)(DisplayQR);
