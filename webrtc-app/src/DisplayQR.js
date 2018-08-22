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
  // fetchArbiter,
  ICE_SERVERS,
} from './webrtc';
import { resetUserAStore, setUserAArbiter } from './actions';
import { socket } from './websockets';
import logging from './utils/logging';
import Chat from './Chat';

type Props = {
  rtcId: string,
  dispatch: () => Promise,
  arbiter: {},
};

class DisplayQR extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      qrcode: '',
      connecting: true,
      // iceCandidates: [],
    };
    // set up initial webrtc connection
    this.connection = null;
    this.channel = null;
    this.socket = null;
  }

  async componentDidMount() {
    try {
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
      this.socket.on('update', (arbiter) => {
        // update redux store
        console.log('socket io update User A');
        console.log(arbiter);
        dispatch(setUserAArbiter(arbiter));
      });
      console.log(rtcId.length);
    } catch (err) {
      console.log(err);
    }
  }

  async componentDidUpdate(prevProps) {
    try {
      // generate a new qrcode if the rtcId value changes
      const { arbiter } = this.props;

      // set remote description
      if (
        this.connection &&
        arbiter &&
        arbiter.ZETA.ANSWER &&
        (arbiter.ZETA.ANSWER.sdp !== prevProps.arbiter.ZETA.ANSWER.sdp ||
          arbiter.ZETA.ANSWER.type !== prevProps.arbiter.ZETA.ANSWER.type)
      ) {
        console.log(`setting answer to ${arbiter.ZETA.ANSWER}`);
        await this.connection.setRemoteDescription(
          new RTCSessionDescription(arbiter.ZETA.ANSWER),
        );
      }
      // set ice candidate
      if (
        this.connection &&
        arbiter &&
        arbiter.ZETA.ICE_CANDIDATE &&
        (arbiter.ZETA.ICE_CANDIDATE.candidate !==
          prevProps.arbiter.ZETA.ICE_CANDIDATE.candidate ||
          arbiter.ZETA.ICE_CANDIDATE.sdpMLineIndex !==
            prevProps.arbiter.ZETA.ICE_CANDIDATE.sdpMLineIndex ||
          arbiter.ZETA.ICE_CANDIDATE.sdpMid !==
            prevProps.arbiter.ZETA.ICE_CANDIDATE.sdpMid)
      ) {
        console.log(`setting ice candidate to ${arbiter.ZETA.ICE_CANDIDATE}`);
        await this.connection.addIceCandidate(
          new RTCIceCandidate(arbiter.ZETA.ICE_CANDIDATE),
        );
        console.log(``);
      }
    } catch (err) {
      console.log(err);
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
    // clear polling interval
    const { dispatch } = this.props;
    dispatch(resetUserAStore());
  }

  initiateWebrtc = async () => {
    try {
      const { dispatch } = this.props;
      // create webrtc instance
      console.log('creating w3ebrtc data channel');
      this.connection = new RTCPeerConnection(ICE_SERVERS);
      logging(this.connection, 'UserA');

      window.ca = this.connection;
      // handle ice
      this.connection.onicecandidate = this.updateIce;
      // disconnect if ice connection fails
      this.connection.oniceconnectionstatechange = this.handleIce;
      // send ice candidates when done collecting
      // this.connection.onicegatheringstatechange = this.sendIce;
      // create data channel
      this.channel = this.connection.createDataChannel('connect');
      // handle channel events
      this.updateChannel();
      // create offer and set local connection
      console.log('creating offer');
      let offer = await this.connection.createOffer();
      if (!offer) offer = await this.connection.createOffer();
      if (!offer) offer = await this.connection.createOffer();
      await this.connection.setLocalDescription(offer);
      // update redux store
      await dispatch(update({ type: OFFER, person: ALPHA, value: offer }));
    } catch (err) {
      console.log(err);
    }
  };

  updateChannel = () => {
    if (this.channel) {
      this.channel.onopen = () => {
        console.log('user A channel opened');
        this.setState({
          connecting: false,
        });
      };
      this.channel.onclose = () => {
        console.log('user A channel closed');
        this.setState({
          connecting: true,
        });
      };
      // this.channel.onmessage = (e) => {
      //   console.log(`user A recieved message ${e.data}`);
      //   console.log(e);
      // };
    }
  };

  updateIce = async (e) => {
    try {
      const { dispatch } = this.props;
      // const { iceCandidates } = this.state;
      if (e.candidate) {
        /**
         * update the signaling server arbiter with ice candidate info
         * @param person = ZETA
         * @param type = ICE_CANDIDATE
         * @param value = e.candidate
         */

        // experimenting with a new way to update ice candidates
        // append all candidates in array then send when collection is finished

        dispatch(
          update({
            person: ALPHA,
            type: ICE_CANDIDATE,
            value: e.candidate,
          }),
        );
        // might implement in the future
        // this.setState({
        //   iceCandidates: [...iceCandidates, e.candidate],
        // });
        console.log(e.candidate);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  sendIce = () => {
    // const { dispatch } = this.props;
    // const { iceCandidates } = this.state;
    if (this.connection)
      console.log(`ice gathering state: `, this.connection.iceGatheringState);
    // send array instead of string value
    // if (this.connection.iceGatheringState === 'complete') {
    //   dispatch(
    //     update({
    //       person: ALPHA,
    //       type: ICE_CANDIDATE,
    //       value: iceCandidates,
    //     }),
    //   );
    // }
  };

  handleIce = () => {
    if (this.connection) {
      const { iceConnectionState } = this.connection;
      console.log(`user b ice connection state ${iceConnectionState}`);
      if (
        iceConnectionState === 'failed' ||
        iceConnectionState === 'disconnected' ||
        iceConnectionState === 'closed'
      ) {
        this.setState({
          connecting: true,
        });
      }
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

  renderDefault = () => (
    <div className="qrcode-screen">
      {' '}
      <div
        className="qrcode"
        dangerouslySetInnerHTML={{ __html: this.state.qrcode }}
      />
      {this.props.rtcId}
    </div>
  );

  render() {
    const { connecting } = this.state;
    return (
      <div className="qrcode-screen">
        {connecting ? (
          this.renderDefault()
        ) : (
          <Chat user="UserA" channel={this.channel} {...this.props} />
        )}
      </div>
    );
  }
}

export default connect((s) => s.userA)(DisplayQR);
