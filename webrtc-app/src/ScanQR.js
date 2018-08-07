// @flow

import React, { Component } from 'react';
import nacl from 'tweetnacl';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import { setUserBRtcId } from './actions';
import { fetchDispatcher, update, ZETA, ANSWER } from './actions/api';

type Props = {
  dispatch: Function,
};

class ScanQR extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
    this.connection = null;
    this.channel = null;
    this.socket = null;
  }

  async componentDidUpdate(prevProps) {
    // generate a new qrcode if the rtcId value changes
    const { dispatcher, dispatch } = this.props;
    console.log(dispatcher);
    // set remote description
    // create answer
    // send updated state to server
    if (
      this.connection &&
      dispatcher &&
      dispatcher.ALPHA.OFFER &&
      (dispatcher.ALPHA.OFFER.sdp !== prevProps.dispatcher.ALPHA.OFFER.sdp ||
        dispatcher.ALPHA.OFFER.type !== prevProps.dispatcher.ALPHA.OFFER.type)
    ) {
      // set remote description
      await this.connection.setRemoteDescription(
        new RTCSessionDescription(dispatcher.ALPHA.OFFER),
      );
      // create answer
      const answer = await this.connection.createAnswer();
      // send answer to signal server
      await dispatch(update({ person: ZETA, type: ANSWER, value: answer }));
    }

    // set local description
    if (
      this.connection &&
      dispatcher &&
      dispatcher.ZETA.ANSWER &&
      (dispatcher.ZETA.ANSWER.sdp !== prevProps.dispatcher.ZETA.ANSWER.sdp ||
        dispatcher.ZETA.ANSWER.type !== prevProps.dispatcher.ZETA.ANSWER.type)
    ) {
      await this.connection.setLocalDescription(
        new RTCSessionDescription(dispatcher.ZETA.ANSWER),
      );
    }
  }

  initiateWebrtc = async (rtcId) => {
    const { dispatch } = this.props;
    // set rtc token
    await dispatch(setUserBRtcId(rtcId));
    // create webrtc peer connection
    this.connection = new RTCPeerConnection(null);
    // fetch dispatcher
    await dispatch(fetchDispatcher(ZETA));
    // set remote connection
  };

  render() {
    const { dispatch } = this.props;
    return (
      <div className="qrcode-screen">
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
  }
}

export default connect((s) => s.userB)(ScanQR);
