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
  }

  initiateWebrtc = async (rtcId) => {
    const { dispatch } = this.props;
    await dispatch(setUserBRtcId(rtcId));
    // create webrtc peer connection
    this.connection = new RTCPeerConnection(null);
    const {
      ALPHA: { OFFER },
    } = await dispatch(fetchDispatcher(rtcId));
    console.log(OFFER);
    await this.connection.setRemoteDescription(
      new RTCSessionDescription(OFFER),
    );
    const answer = await this.connection.createAnswer();
    await dispatch(update({ person: ZETA, type: ANSWER, value: answer }));
    await this.connection.setLocalDescription(answer);
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
            onChange={async (e) => {
              this.setState({ value: e.target.value });
              this.initiateWebrtc(e.target.value);
            }}
          />
        </div>
      </div>
    );
  }
}

export default connect((s) => s.userB)(ScanQR);
