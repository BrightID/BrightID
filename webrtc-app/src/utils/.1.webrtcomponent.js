// @flow

import React, { Component } from 'react';
import nacl from 'tweetnacl';
import { connect } from 'react-redux';
// import JsonView from 'react-json-view';
import logging from './utils/logging';
import { setPublicKey2, setTimestamp, setPublicKey3 } from './actions';
import { genMsg } from './actions/exchange';
import { avatar } from './utils/toDataUrl';
import {
  fetchEntries,
  createRTCId,
  update,
  USERA,
  USERB,
  ICE_CANDIDATE,
  OFFER,
  ANSWER,
} from './actions/api';
import { timeout } from '../node_modules/rxjs/operator/timeout';

window.nacl = nacl;

/**
 * Constants
 */

const DELAY = 500;

/**
 * =============================
 */

type Props = {
  dispatch: Function,
};

class WebRTC extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      localMessage: '',
      remoteMessages: [],
      localMessages: [],
      readyState: '',
      ahoyRecieved: '',
      msgSent: '',
      msgCorrect: '',
      cDataSent: '',
    };
    this.lc = null;
    this.rc = null;
    this.rcDataChannel = null;
    this.lcDataChannel = null;
  }

  componentDidMount() {
    // create RTC ID
    // make sure the signalling server is running locally
    // this.props.dispatch(createRTCId());
    this.timerId = setInterval(() => {
      this.updateRtc();
    }, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  createRcDataChannel = (event) => {
    console.log('creating rc data channel');

    this.rcDataChannel = event.channel;
    console.log(event.channel);

    /**
     * Send ahoy, signalling that both data channels are open
     * and ready to transmit data
     */

    if (this.rcDataChannel && this.rcDataChannel.readyState === 'open') {
      const dataObj = {
        timestamp: Date.now(),
        msg: 'wadata',
      };
      this.rcDataChannel.send(JSON.stringify(dataObj));
      console.log('ahoy message sent');
    }

    /**
     * handle recieving messages
     */

    this.rcDataChannel.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      console.log('rc receive message:');
      console.log(e.data);

      /**
       * Upon recieving ahoy back, with timestamp and public key,
       * set the timestamp to be used in the message
       * and send UserA connection data
       */

      if (
        msg.msg === 'wadatai' &&
        this.rcDataChannel &&
        this.rcDataChannel.readyState === 'open'
      ) {
        // set new connection timestamp
        this.props.dispatch(setTimestamp(msg.timestamp));
        this.props.dispatch(setPublicKey3(msg.publicKey));

        const { publicKey } = nacl.sign.keyPair();

        const nameornym = 'UserB';

        const dataObj = {
          timestamp: Date.now(),
          publicKey,
          avatar,
          nameornym,
        };
        // send public key to person who initiated contact
        this.rcDataChannel.send(JSON.stringify(dataObj));
      }

      /**
       * Upon recieving signed message, verify it is correct
       */

      if (
        msg.signedMsg &&
        this.rcDataChannel &&
        this.rcDataChannel.readyState === 'open'
      ) {
        // set new connection timestamp
        const {
          publicKey,
          publicKey2,
          publicKey3,
          timestamp,
          message,
        } = this.props;

        const signedMsg = new Uint8Array(Object.values(msg.signedMsg));
        const openedMsg = nacl.sign.open(signedMsg, publicKey3);

        console.log(
          'signed messaged correct?',
          openedMsg.toString() === message.toString(),
        );

        if (openedMsg.toString() === message.toString()) {
          this.setState({
            msgCorrect: Date.now(),
          });
        }
      }
    };

    this.rcDataChannel.onopen = () => {
      console.log('rcDataChannel opened');
    };

    this.rcDataChannel.onclose = () => {
      console.log('rcDataChannel closed');
    };

    window.rcDataChannel = this.rcDataChannel;
  };

  connectPeers = async () => {
    try {
      const { dispatch } = this.props;
      console.log('connecting peers...');

      // const cert = await RTCPeerConnection.generateCertificate({
      //   name: 'RSASSA-PKCS1-v1_5',
      //   hash: 'SHA-256',
      //   modulusLength: 2048,
      //   publicExponent: new Uint8Array([1, 0, 1]),
      // });

      // lc = new RTCPeerConnection({
      //   iceCandidatePoolSize: 1,
      //   iceServers: [{ url: 'stun:stun.l.google.com:19302' }],
      // });
      this.lc = new RTCPeerConnection(null);
      window.lc = this.lc;

      this.rc = new RTCPeerConnection(null);
      window.rc = this.rc;
      logging(this.lc, 'lc');
      logging(this.rc, 'rc');

      this.lc.onicecandidate = async (e) => {
        console.log('lc icecandidate: ', e.candidate);
        try {
          if (e.candidate) {
            // console.log('setting rc ice candidate');
            // await this.rc.addIceCandidate(e.candidate);
            /**
             * update the signaling server dispatcher with ice candidate info
             * @param person = USERA
             * @param type = ICE_CANDIDATE
             * @param value = e.candidate
             */
            //
            //
            //
            dispatch(
              update({
                person: USERA,
                type: ICE_CANDIDATE,
                value: e.candidate,
              }),
            );
            window.lcCandidate = e.candidate;
          }
        } catch (err) {
          console.warn(err);
        }
      };

      this.rc.onicecandidate = async (e) => {
        console.log('rc icecandidate: ', e.candidate);
        try {
          if (e.candidate && this.lc) {
            /**
             * update the signaling server dispatcher with ice candidate info
             * @param person = USERB
             * @param type = ICE_CANDIDATE
             * @param value = e.candidate
             */
            //
            //
            //
            dispatch(
              update({ person: USERB, type: ICE_CANDIDATE, value: e.candidate }),
            );
            window.rcCandidate = e.candidate;
          }
        } catch (err) {
          console.warn(err);
        }
      };

      this.lcDataChannel = this.lc.createDataChannel('chat');
      window.lcDataChannel = this.lcDataChannel;

      /**
       * Seting up WebRTC connection
       * requires a signalling server in the future
       */

      /**
       * Creating Offer
       *
       * note:
       * must send offer to the signalling server
       */

      console.log('creating offer');

      const offer = await this.lc.createOffer();

      // update the signaling server
      dispatch(update({ person: USERA, type: OFFER, value: offer }));

      /**
       * Setting lc local description
       */

      console.log('setting lc local description');

      await this.lc.setLocalDescription(new RTCSessionDescription(offer));

      /**
       * When channel opens, begin info exchange
       */

      this.lcDataChannel.onopen = () => {
        console.log('lcDataChannel opened');

        this.lcDataChannelOpened();
      };

      this.lcDataChannel.onclose = () => {
        console.log('lcDataChannel closed');
        this.setState({
          readyState: '',
        });
      };

      /**
       * handle recieving messages
       */

      this.lcDataChannel.onmessage = this.handleRecieveMessage;

      /**
       * ======================================================
       */

      this.rc.ondatachannel = (e) => {
        /**
         * creating second data channel
         */

        setTimeout(() => {
          this.createRcDataChannel(e);
        }, DELAY);
      };
    } catch (err) {
      console.log(err);
    }
  };

  updateRtc = async () => {
    try {
      const { dispatch, dispatcher } = this.props;
      if (this.rc && dispatcher && dispatcher.USERA) {
        /**
         * Setting rc ice candidate
         */

        if (
          this.rc.iceConnectionState === 'new' &&
          this.rc.remoteDescription.type &&
          dispatcher.USERA.ICE_CANDIDATE
        ) {
          console.log('setting rc ice candidate');
          console.log(new RTCIceCandidate(dispatcher.USERA.ICE_CANDIDATE));
          await this.rc.addIceCandidate(
            new RTCIceCandidate(dispatcher.USERA.ICE_CANDIDATE),
          );
        }

        /**
         * Setting rc remote description
         */

        if (!this.rc.remoteDescription.type && dispatcher.USERA.OFFER) {
          console.log('setting rc remote description');

          await this.rc.setRemoteDescription(
            new RTCSessionDescription(dispatcher.USERA.OFFER),
          );
        }

        /**
         * Creating Answer
         *
         * note:
         * must send offer to the signalling server
         */

        if (!this.rc.localDescription.type) {
          console.log('creating answer');

          const answer = await this.rc.createAnswer();
          // update the signaling server
          dispatch(update({ person: USERB, type: ANSWER, value: answer }));

          /**
           * Setting rc local description
           */

          console.log('setting rc local description');

          await this.rc.setLocalDescription(new RTCSessionDescription(answer));
        }
      }

      if (this.lc && dispatcher && dispatcher.USERB) {
        /**
         * Setting rc ice candidate
         */

        if (
          this.lc.iceConnectionState === 'new' &&
          this.lc.remoteDescription.type &&
          dispatcher.USERB.ICE_CANDIDATE
        ) {
          console.log('setting lc ice candidate');
          console.log(dispatcher.USERB.ICE_CANDIDATE);
          await this.lc.addIceCandidate(
            new RTCIceCandidate(dispatcher.USERB.ICE_CANDIDATE),
          );
        }

        /**
         * Setting lc remote description
         */

        if (!this.lc.remoteDescription.type) {
          console.log('setting lc remote description');

          await this.lc.setRemoteDescription(
            new RTCSessionDescription(dispatcher.USERB.ANSWER),
          );
        }

        // this should finish connection setup
      }
    } catch (err) {
      throw err;
    }
  };

  handleRecieveMessage = (e) => {
    console.log('lc recieve message:');
    console.log(e.data);
    const msg = JSON.parse(e.data);
    const { publicKey } = this.props;
    // if we recieve a public key
    // update the app store with the second key
    if (
      msg.msg === 'wadata' &&
      this.lcDataChannel &&
      this.lcDataChannel.readyState === 'open'
    ) {
      let dataObj = {
        timestamp: Date.now(),
        msg: 'wadatai',
        publicKey,
      };

      this.lcDataChannel.send(JSON.stringify(dataObj));

      this.setState({
        ahoyRecieved: msg.timestamp,
        cDataSent: dataObj.timestamp,
      });

      // create data object with timestamp, publicKey, image, and nameornym
      const nameornym = 'UserA';

      dataObj = {
        timestamp: Date.now(),
        publicKey,
        avatar,
        nameornym,
      };

      console.log('sending user data to remote user');

      // send public key to person who initiated contact
      this.lcDataChannel.send(JSON.stringify(dataObj));
    }

    if (msg.publicKey && msg.avatar && msg.nameornym) {
      this.props.dispatch(setPublicKey2(msg));
    }
    // append all messages locally
    const { localMessages } = this.state;
    localMessages.push(msg);
    this.setState({
      localMessages,
    });
  };

  lcDataChannelOpened = () => {
    this.setState({
      readyState: true,
    });

    console.log('lc user data sent');
  };

  handleDisconnect = () => {
    // Close the RTCDataChannels if they're open

    this.lcDataChannel.close();
    this.rcDataChannel.close();

    // Close the RTCPeerConnections

    this.lc.close();
    this.rc.close();

    this.lcDataChannel = null;
    this.rcDataChannel = null;
    this.lc = null;
    this.rc = null;

    this.setState({
      localMessage: '',
      localMessages: [],
      remoteMessages: [],
      readyState: '',
      ahoyRecieved: '',
      msgSent: '',
      msgCorrect: '',
      cDataSent: '',
    });
  };

  handleSendMessage = () => {
    console.log('sending message...');
    const { localMessage } = this.state;
    console.log(localMessage);
    this.lcDataChannel.send(localMessage);
    this.messageInputBox.focus();
    this.setState({ localMessage: '' });
  };

  handleNewConnection = async () => {
    // generate and sign pairing message
    await this.props.dispatch(genMsg());
    // send signed message to UserB
    const { signedMsg } = this.props;
    if (signedMsg) {
      const dataObj = {
        timestamp: Date.now(),
        signedMsg,
      };
      this.lcDataChannel.send(JSON.stringify(dataObj));
      this.setState({
        msgSent: dataObj.timestamp,
      });
    }
  };

  renderCD = () => (
    <div>
      <div className="connect-buttons">
        <button
          id="connectButton"
          type="button"
          name="connectButton"
          ref={(node) => {
            this.connectButton = node;
          }}
          className="btn btn-success buttonleft"
          onClick={this.connectPeers}
          disabled={this.state.readyState}
        >
          C
        </button>
        <button
          id="disconnectButton"
          type="button"
          name="disconnectButton"
          ref={(node) => {
            this.disconnectButton = node;
          }}
          className="btn btn-danger buttonright"
          onClick={this.handleDisconnect}
          disabled={!this.state.readyState}
        >
          D
        </button>
        {this.state.readyState ? (
          <span className="p-2">Connected - ready to transmit data</span>
        ) : (
          <span className="p-2">Disconnected</span>
        )}
      </div>

      {/* <div className="local-messages">
        {this.state.localMessages.map((msg, i) => (
          <JsonView
            key={i + msg}
            src={JSON.parse(msg)}
            collapsed={1}
            theme="rjv-default"
          />
        ))}
      </div> */}
    </div>
  );

  renderAhoyRecieved = () => {
    if (this.state.ahoyRecieved) {
      return (
        <div className="ml-2">{this.state.ahoyRecieved}: Recieved Ahoy</div>
      );
    }
  };

  renderMsgCorrect = () => {
    if (this.state.msgCorrect) {
      return (
        <div className="ml-2">
          {this.state.msgCorrect}: Message correctly recieved and verified
        </div>
      );
    }
  };

  rendercDataSent = () => {
    if (this.state.cDataSent) {
      return (
        <div className="ml-2">
          {this.state.cDataSent}: Sent timestamp and public key to UserB
        </div>
      );
    }
  };

  renderPublicKeyRecieved = () => {
    if (this.props.publicKey2.length > 1 && this.state.localMessages[0]) {
      return (
        <div className="ml-2">
          {this.state.localMessages[0].timestamp}: Recieved PublicKey, Name,
          Image from UserB
        </div>
      );
    }
  };

  renderSentMsg = () => {
    if (this.state.msgSent) {
      return (
        <div className="ml-2">
          {this.state.msgSent}: Sent signed message to UserB
        </div>
      );
    }
  };

  renderConnectWith = () => {
    if (this.props.publicKey2.length > 1) {
      return (
        <div className="connect-with">
          Would you like to connect with {this.props.nameornym2}?
          <img
            src={this.props.avatar2}
            alt="user avatar 2"
            className="avatar2"
          />
          <button
            type="button"
            className="btn btn-primary ml-2"
            name="yes connect"
            onClick={this.handleNewConnection}
          >
            Yes
          </button>
          <button
            type="button"
            className="btn btn-primary ml-2"
            name="no connect"
            onClick={this.handleDisconnect}
          >
            No
          </button>
        </div>
      );
    }
  };

  renderAPIButtons = () => (
    <div className="api-buttons">
      <button
        type="button"
        className="btn btn-primary ml-2"
        name="fetch entries"
        onClick={() => {
          this.props.dispatch(fetchEntries());
        }}
      >
        Fetch Entries
      </button>
      <button
        type="button"
        className="btn btn-primary ml-2"
        name="create ID"
        onClick={() => {
          this.props.dispatch(createRTCId());
        }}
      >
        Create ID
      </button>
      <button
        type="button"
        className="btn btn-primary ml-2"
        name="create ID"
        onClick={() => {
          this.updateRtc();
        }}
      >
        Try it
      </button>
    </div>
  );

  render() {
    return (
      <div>
        <div>WebRTC Data logs</div>
        <hr />
        {this.renderAPIButtons()}
        <hr />
        {this.renderCD()}
        <hr />
        {this.renderAhoyRecieved()}
        <hr />
        {this.rendercDataSent()}
        <hr />
        {this.renderPublicKeyRecieved()}
        <hr />
        {this.renderConnectWith()}
        <hr />
        {this.renderSentMsg()}
        <hr />
        {this.renderMsgCorrect()}
        <hr />
      </div>
    );
  }
}

export default connect((s) => s.userA)(WebRTC);
