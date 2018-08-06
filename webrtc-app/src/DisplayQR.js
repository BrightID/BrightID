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
  fetchDispatcher,
} from './actions/api';
import { resetStore, setUserADispatcher } from './actions';
import { socket } from './websockets';

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
    const { dispatch, waiting } = this.props;
    const rtcId = await dispatch(createRTCId());
    console.log(`displayQr ${rtcId}`);
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
      console.log('socket io update');
      console.log(dispatcher);
      dispatch(setUserADispatcher(dispatcher));
    });
  }

  async componentDidUpdate(prevProps) {
    // generate a new qrcode if the rtcId value changes
    const { rtcId, dispatcher } = this.props;
    // regen qr code
    if (prevProps.rtcId !== rtcId) {
      this.genQrCode();
    }
    // set local description
    if (
      this.connection &&
      dispatcher &&
      dispatcher.ALPHA.OFFER &&
      (dispatcher.ALPHA.OFFER.sdp !== prevProps.dispatcher.ALPHA.OFFER.sdp ||
        dispatcher.ALPHA.OFFER.type !== prevProps.dispatcher.ALPHA.OFFER.type)
    ) {
      await this.connection.setLocalDescription(
        new RTCSessionDescription(dispatcher.ALPHA.OFFER),
      );
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
