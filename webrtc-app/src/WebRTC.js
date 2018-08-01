import React, { Component } from 'react';
import nacl from 'tweetnacl';
import { connect } from 'react-redux';
// import JsonView from 'react-json-view';
import logging from './utils/logging';
import { setPublicKey2, resetStore } from './actions';
// import { genMsg } from './actions/exchange';
import { avatar } from './utils/toDataUrl';

window.nacl = nacl;

class WebRTC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localMessage: '',
      remoteMessages: [],
      localMessages: [],
      readyState: '',
    };
  }

  connectPeers = async () => {
    try {
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
          if (e.candidate && this.rc) {
            console.log('setting rc ice candidate');
            await this.rc.addIceCandidate(e.candidate);
          }
        } catch (err) {
          console.warn(err);
        }
      };

      this.rc.onicecandidate = async (e) => {
        console.log('rc icecandidate: ', e.candidate);
        try {
          if (e.candidate && this.lc) {
            console.log('setting lc ice candidate');
            await this.lc.addIceCandidate(e.candidate);
          }
        } catch (err) {
          console.warn(err);
        }
      };

      this.lcDataChannel = this.lc.createDataChannel('chat');
      window.lcDataChannel = this.lcDataChannel;

      console.log('creating offer');
      const offer = await this.lc.createOffer();
      console.log('setting lc local description');
      await this.lc.setLocalDescription(new RTCSessionDescription(offer));

      // note: pass the offer (localDescription) to the remote device
      // in order to connect via webrtc
      console.log('setting rc remote description');
      await this.rc.setRemoteDescription(
        new RTCSessionDescription(this.lc.localDescription),
      );
      console.log('creating answer');
      const answer = await this.rc.createAnswer();
      console.log('setting rc local description');
      await this.rc.setLocalDescription(new RTCSessionDescription(answer));
      console.log('setting lc remote description');
      await this.lc.setRemoteDescription(
        new RTCSessionDescription(this.rc.localDescription),
      );

      this.lcDataChannel.onopen = (e) => {
        console.log('lcDataChannel opened');
        this.handleLcDataChannelStatusChange();
      };

      this.lcDataChannel.onclose = (e) => {
        console.log('lcDataChannel closed');
        this.handleLcDataChannelStatusChange();
      };

      /**
       * handle recieving messages
       */

      this.lcDataChannel.onmessage = (e) => {
        console.log('lc recieve message:');
        console.log(e.data);
        this.handleRecieveMessage(e.data);
      };

      /**
       =====================================
      */

      /**
       * create second data channel
       */

      this.rc.ondatachannel = (e) => {
        console.log('creating rcDataChannel');
        this.rcDataChannel = e.channel;

        // generate keypair to send across the wire
        const { publicKey } = nacl.sign.keyPair();
        // create data object with timestamp, publicKey, image, and nameornym
        const nameornym = 'UserA';

        const dataObj = { time: Date.now(), publicKey, avatar, nameornym };
        // send public key to person who initiated contact
        this.rcDataChannel.send(JSON.stringify(dataObj));

        this.rcDataChannel.onmessage = () => {
          console.log('message:');
          console.log(e.data);
          // store and display remote messages recieved
          const { remoteMessages } = this.state;
          remoteMessages.push(e.data);
          this.setState({
            remoteMessages,
          });
        };

        /**
       =====================================
      */

        this.rcDataChannel.onopen = (e) => {
          console.log('rcDataChannel opened');
        };
        this.rcDataChannel.onclose = (e) => {
          console.log('rcDataChannel closed');
        };

        // send the key
        window.rcDataChannel = this.rcDataChannel;
      };
    } catch (err) {
      console.log(err);
    }
  };

  handleLcDataChannelStatusChange = () => {
    if (this.lcDataChannel) {
      const { readyState } = this.lcDataChannel;
      if (readyState === 'open') {
        this.setState({
          readyState: true,
        });
      } else {
        this.setState({
          readyState: '',
        });
      }
    } else {
      this.setState({
        readyState: '',
      });
    }
  };

  handleDisconnect = () => {
    // Close the RTCDataChannels if they're open
    this.props.dispatch(resetStore());
    this.lcDataChannel.close();
    this.rcDataChannel.close();

    // Close the RTCPeerConnections

    this.lc.close();
    this.rc.close();

    this.lcDataChannel = null;
    this.rcDataChannel = null;
    this.lc = null;
    this.rc = null;

    // Update user interface elements

    // this.connectButton.disabled = false;
    // this.disconnectButton.disabled = true;
    // this.sendButton.disabled = true;
    // this.messageInputBox.disabled = true;
    this.setState({ localMessage: '', localMessages: [], remoteMessages: [] });
  };

  handleSendMessage = () => {
    console.log('sending message...');
    const { localMessage } = this.state;
    console.log(localMessage);
    this.lcDataChannel.send(localMessage);
    this.messageInputBox.focus();
    this.setState({ localMessage: '' });
  };

  handleRecieveMessage = (data) => {
    const msg = JSON.parse(data);
    // if we recieve a public key
    // update the app store with the second key
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

  renderPublicKeyRecieved = () => {
    if (this.props.publicKey2.length > 1 && this.state.localMessages[0]) {
      return (
        <div className="ml-2">
          {this.state.localMessages[0].time}: Recieved PublicKey, Name, Image
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
        </div>
      );
    }
  };

  render() {
    return (
      <div>
        {this.renderCD()}
        <hr />
        {this.renderPublicKeyRecieved()}
        <hr />
        {this.renderConnectWith()}
        <hr />
      </div>
    );
  }
}

export default connect((s) => s)(WebRTC);
