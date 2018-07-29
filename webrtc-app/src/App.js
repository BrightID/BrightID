import React, { Component } from 'react';
import nacl from 'tweetnacl';
import QRCode from 'qrcode';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

window.nacl = nacl;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localMessage: '',
      remoteMessages: [],
      keys: {},
      qrcode: '',
      readyState: '',
    };
  }

  async componentDidMount() {
    const keys = nacl.sign.keyPair();
    this.setState({
      keys,
    });
    QRCode.toString(keys.publicKey.toString(), (err, qrcode) => {
      if (err) throw err;
      this.setState({
        qrcode,
      });
    });
    console.log(keys);
  }

  genQrCode = () => {};

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

      this.lc.onaddstream = (e) => {
        console.log('onaddstream');
        console.log(e);
      };

      this.lc.onconnectionstatechange = (e) => {
        console.log('onaddstream');
        console.log(e);
      };

      this.lc.ondatachannel = (e) => {
        console.log('ondatachannel');
        console.log(e);
      };

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

      this.rc.oniceconnectionstatechange = (e) => {
        if (this.rc) console.log('rc: ', this.rc.iceConnectionState);
      };

      this.rc.onicegatheringstatechange = (e) => {
        if (this.rc) console.log('rc: ', this.rc.iceGatheringState);
      };

      this.lc.oniceconnectionstatechange = (e) => {
        if (this.lc) console.log('lc: ', this.lc.iceConnectionState);
      };

      this.lc.onicegatheringstatechange = (e) => {
        if (this.lc) console.log('lc: ', this.lc.iceGatheringState);
      };

      this.lc.onidentityresult = (e) => {
        console.log('onidentityresult');
        console.log(e);
      };

      this.lc.onidpassertionerror = (e) => {
        console.log('onidpassertionerror');
        console.log(e);
      };

      this.lc.onidpvalidationerror = (e) => {
        console.log('onidpvalidationerror');
        console.log(e);
      };

      this.lc.onnegotiationneeded = async (e) => {
        try {
          // const offer2 = await lc.createOffer();
          console.log('onnegotiationneeded');
          // await lc.setLocalDescription(offer2);
          // await rc.setRemoteDescription(offer2);
          // const answer2 = await rc.createAnswer();
          // await rc.setLocalDescription(answer2);
          // await lc.setRemoteDescription(answer2);
        } catch (err) {
          console.log(err);
        }
      };

      this.lc.onpeeridentity = (e) => {
        console.log('onpeeridentity');
        console.log(e);
      };

      this.lc.onremovestream = (e) => {
        console.log('onremovestream');
        console.log(e);
      };

      this.rc.onsignalingstatechange = (e) => {
        if (this.rc) console.log('rc state:', this.rc.signalingState);
      };

      this.lc.onsignalingstatechange = (e) => {
        if (this.lc) console.log('lc state:', this.lc.signalingState);
      };

      this.lc.ontrack = (e) => {
        console.log('ontrack');
        console.log(e);
      };

      this.lcDataChannel = this.lc.createDataChannel('chat');
      window.lcDataChannel = this.lcDataChannel;

      this.lcDataChannel.onopen = (e) => {
        console.log('lcDataChannel opened');
        this.handleLcDataChannelStatusChange();
      };

      this.lcDataChannel.onclose = (e) => {
        console.log('lcDataChannel closed');
        this.handleLcDataChannelStatusChange();
      };

      this.lcDataChannel.onmessage = (e) => {
        console.log('lc recieve message:');
        console.log(e.data);
      };

      this.rc.ondatachannel = (e) => {
        console.log('creating rcDataChannel');
        this.rcDataChannel = e.channel;
        window.rcDataChannel = this.rcDataChannel;
        this.rcDataChannel.onmessage = (e) => {
          console.log('message:');
          console.log(e.data);
          const { remoteMessages } = this.state;
          remoteMessages.push(e.data);
          this.setState({
            remoteMessages,
          });
          // this.handleReceiveMessage(e)
        };
        this.rcDataChannel.onopen = (e) => {
          console.log('rcDataChannel opened');
        };
        this.rcDataChannel.onclose = (e) => {
          console.log('rcDataChannel closed');
        };
      };

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
        // this.messageInputBox.disabled = false;
        this.messageInputBox.focus();
        // this.sendButton.disabled = false;
        // this.disconnectButton.disabled = false;
        // this.connectButton.disabled = true;
      } else {
        this.setState({
          readyState: '',
        });
        // this.messageInputBox.disabled = true;
        // this.sendButton.disabled = true;
        // this.connectButton.disabled = true;
        // this.disconnectButton.disabled = true;
      }
    } else {
      this.setState({
        readyState: '',
      });
    }
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

    // Update user interface elements

    // this.connectButton.disabled = false;
    // this.disconnectButton.disabled = true;
    // this.sendButton.disabled = true;
    // this.messageInputBox.disabled = true;
    this.setState({ localMessage: '' });
  };

  handleSendMessage = () => {
    console.log('sending message...');
    const { localMessage } = this.state;
    console.log(localMessage);
    this.lcDataChannel.send(localMessage);
    this.messageInputBox.focus();
    this.setState({ localMessage: '' });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Webrtc Demo</h1>
        </header>
        <div className="connect-buttons">
          {/* {this.state.qrcode} */}
          <div
            className="qrcode"
            dangerouslySetInnerHTML={{ __html: this.state.qrcode }}
          />
          <button
            id="connectButton"
            type="button"
            name="connectButton"
            ref={(node) => (this.connectButton = node)}
            className="btn btn-success buttonleft"
            onClick={this.connectPeers}
            disabled={this.state.readyState}
          >
            Connect
          </button>
          <button
            id="disconnectButton"
            type="button"
            name="disconnectButton"
            ref={(node) => (this.disconnectButton = node)}
            className="btn btn-danger buttonright"
            onClick={this.handleDisconnect}
            disabled={!this.state.readyState}
          >
            Disconnect
          </button>
        </div>
        <div className="messagebox ">
          <label htmlFor="message">
            Enter a message:
            <input
              type="text"
              name="message"
              ref={(node) => {
                this.messageInputBox = node;
              }}
              className="input-control"
              id="message"
              placeholder="Message text"
              inputMode="latin"
              size={60}
              maxLength={120}
              value={this.state.localMessage}
              onChange={(e) => {
                this.setState({ localMessage: e.target.value });
              }}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  this.handleSendMessage();
                }
              }}
              disabled={!this.state.readyState}
            />
          </label>
          <button
            id="sendButton"
            type="button"
            name="sendButton"
            className="buttonright btn btn-info"
            disabled={!this.state.readyState}
            ref={(node) => (this.sendButton = node)}
            onClick={this.handleSendMessage}
          >
            Send
          </button>
        </div>
        <div className="messagebox" id="receivebox">
          <div>Messages received:</div>
          {this.state.remoteMessages.map((msg, i) => (
            <div key={i + msg}>{msg}</div>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
