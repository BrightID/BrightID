// @flow

import React, { Component } from 'react';
// import nacl from 'tweetnacl';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import { createRTCId, update, OFFER, ALPHA } from './actions/api';
import { resetStore } from './actions';

type Props = {
  rtcId: string,
  dispatch: () => Promise,
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
  }

  async componentDidMount() {
    // fetch rtc id from signaling server
    const { dispatch } = this.props;
    const rtcId = await dispatch(createRTCId());
    console.log(rtcId);
    this.genQrCode();
    this.initiateWebrtc();
  }

  componentDidUpdate(prevProps) {
    // generate a new qrcode if the rtcId value changes
    const { rtcId } = this.props;
    if (prevProps.rtcId !== rtcId) {
      this.genQrCode();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(resetStore());
  }

  initiateWebrtc = async () => {
    const { dispatch } = this.props;
    console.log('creating w3ebrtc data channel');
    this.connection = new RTCPeerConnection(null);
    this.channel = this.connection.createDataChannel('connect');
    console.log('creating offer');
    const offer = await this.connection.createOffer();
    await dispatch(update({ type: OFFER, person: ALPHA, value: offer }));
    await this.connection.setLocalDescription(offer);
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
