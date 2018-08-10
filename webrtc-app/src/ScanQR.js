// @flow

import React, { Component } from 'react';
import nacl from 'tweetnacl';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import { resetUserBStore, setUserBRtcId, setUserBDispatcher } from './actions';
import {
  fetchDispatcher,
  update,
  ZETA,
  ANSWER,
  ICE_CANDIDATE,
} from './actions/api';
import logging from './utils/logging';
import { socket } from './websockets';
import Chat from './Chat';

type Props = {
  dispatch: Function,
};

class ScanQR extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      connecting: true,
    };
    this.connection = null;
    this.channel = null;
    this.socket = null;
  }

  async componentDidUpdate(prevProps) {
    const { dispatcher } = this.props;
    // set ice candidate
    if (
      this.connection &&
      this.connection.remoteDescription &&
      dispatcher &&
      dispatcher.ALPHA.ICE_CANDIDATE &&
      (dispatcher.ALPHA.ICE_CANDIDATE.candidate !==
        prevProps.dispatcher.ALPHA.ICE_CANDIDATE.candidate ||
        dispatcher.ALPHA.ICE_CANDIDATE.sdpMLineIndex !==
          prevProps.dispatcher.ALPHA.ICE_CANDIDATE.sdpMLineIndex ||
        dispatcher.ALPHA.ICE_CANDIDATE.sdpMid !==
          prevProps.dispatcher.ALPHA.ICE_CANDIDATE.sdpMid)
    ) {
      console.log('UserB:');
      console.log(dispatcher.ALPHA.ICE_CANDIDATE);
      await this.connection.addIceCandidate(
        new RTCIceCandidate(dispatcher.ALPHA.ICE_CANDIDATE),
      );
    }
  }

  componentWillUnmount() {
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
    const { dispatch } = this.props;
    dispatch(resetUserBStore());
  }

  setRtcDescription = async (offer) => {
    try {
      const { dispatch } = this.props;
      // set remote description
      await this.connection.setRemoteDescription(
        new RTCSessionDescription(offer),
      );
      // create answer
      const answer = await this.connection.createAnswer();
      // set local description
      await this.connection.setLocalDescription(answer);
      // send answer to signal server
      await dispatch(update({ person: ZETA, type: ANSWER, value: answer }));
    } catch (err) {
      console.log(err);
    }
  };

  initiateWebrtc = async (rtcId) => {
    try {
      const { dispatch } = this.props;
      // set rtc token
      await dispatch(setUserBRtcId(rtcId));
      // create webrtc peer connection
      this.connection = new RTCPeerConnection(null);
      logging(this.connection, 'UserB');
      window.cb = this.connection;
      // handle ice
      this.connection.onicecandidate = this.updateIce;
      // create data channel
      this.connection.ondatachannel = this.updateChannel;
      // fetch dispatcher
      this.connection.oniceconnectionstatechange = this.handleIce;
      const dispatcher = await dispatch(fetchDispatcher(ZETA));
      // return if error or no offer
      if (dispatcher.error || !dispatcher.ALPHA.OFFER) return;
      // set rtc description with offer
      this.setRtcDescription(dispatcher.ALPHA.OFFER);
      // initiate websockets
      this.initiateWebSocket(rtcId);
    } catch (err) {
      console.log(err);
    }
  };

  initiateWebSocket = async (rtcId) => {
    // fetch initial rtc id from signaling server
    const { dispatch } = this.props;
    // join websocket room
    this.socket = socket();
    this.socket.emit('join', rtcId);
    // subscribe to update event
    this.socket.on('update', (dispatcher) => {
      // update redux store
      console.log('socket io update user B');
      console.log(dispatcher);
      dispatch(setUserBDispatcher(dispatcher));
    });
  };

  updateChannel = (event) => {
    if (event.channel) {
      this.channel = event.channel;
      this.channel.onopen = () => {
        console.log('user B channel opened');
        this.setState({
          connecting: false,
        });
      };
      this.channel.onclose = () => {
        console.log('user B channel closed');
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
            person: ZETA,
            type: ICE_CANDIDATE,
            value: e.candidate,
          }),
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  handleIce = () => {
    if (this.connection) {
      const { iceConnectionState } = this.connection;
      console.log(`user b ice connection state ${iceConnectionState}`);
      if (
        iceConnectionState === 'failed' ||
        iceConnectionState === 'disconnected'
      ) {
        this.setState({
          connecting: true,
        });
      }
    }
  };

  renderDefault = () => (
    <div>
      <div className="scan-text">copy / paste the qrcode</div>
      <div className="qr-input">
        <input
          type="text"
          className="form-control"
          placeholder="place id here"
          value={this.state.value}
          onChange={(e) => {
            this.setState({ value: e.target.value });
            // initiate webrtc with rtc token
            this.initiateWebrtc(e.target.value);
          }}
        />
      </div>
    </div>
  );

  render() {
    const { connecting } = this.state;
    return (
      <div className="qrcode-screen">
        {connecting ? (
          this.renderDefault()
        ) : (
          <Chat user="UserB" channel={this.channel} {...this.props} />
        )}
      </div>
    );
  }
}

export default connect((s) => s.userB)(ScanQR);
