import React, { Component } from 'react';
import nacl from 'tweetnacl';
import QRCode from 'qrcode';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

let lc;
let sendChannel;
let receiveChannel;
let rc;

function handleRecieveChannelStatusChange(event) {
  if (receiveChannel) {
    console.log(
      "Receive channel's status has changed to " + receiveChannel.readyState,
    );
  }
}

function handleAddCandidateError(err) {
  console.log(err);
}

function handleCreateDescriptionError(err) {
  console.log(err);
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localSuccess: false,
      remoteSuccess: true,
      open: true,
      localMessage: '',
      remoteMessage: '',
      keys: {},
      qrcode: '',
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
      const cert = await RTCPeerConnection.generateCertificate({
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
      });

      // lc = new RTCPeerConnection({
      //   iceCandidatePoolSize: 1,
      //   iceServers: [{ url: 'stun:stun.l.google.com:19302' }],
      // });
      lc = new RTCPeerConnection(null);
      // sendChannel = lc.createDataChannel('sendChannel');
      // sendChannel.onopen = this.handleSendChannelStatusChange;
      // sendChannel.onclose = this.handleSendChannelStatusChange;
      rc = new RTCPeerConnection(null);

      lc.onaddstream = (e) => {
        console.log('onaddstream');
        console.log(e);
      };

      lc.onconnectionstatechange = (e) => {
        console.log('onaddstream');
        console.log(e);
      };

      lc.ondatachannel = (e) => {
        console.log('ondatachannel');
        console.log(e);
      };

      lc.ondatachannel = (e) => {
        console.log('ondatachannel');
        console.log(e);
      };

      lc.onicecandidate = (e) => {
        console.log('lc icecandidate: ', e.candidate);
      };

      rc.onicecandidate = (e) => {
        console.log('rc icecandidate: ', e.candidate);
      };

      rc.oniceconnectionstatechange = (e) => {
        console.log('rc: ', rc.iceConnectionState);
      };

      rc.onicegatheringstatechange = (e) => {
        console.log('rc: ', rc.iceGatheringState);
      };

      lc.oniceconnectionstatechange = (e) => {
        console.log('lc: ', lc.iceConnectionState);
      };

      lc.onicegatheringstatechange = (e) => {
        console.log('lc: ', lc.iceGatheringState);
      };

      lc.onidentityresult = (e) => {
        console.log('onidentityresult');
        console.log(e);
      };

      lc.onidpassertionerror = (e) => {
        console.log('onidpassertionerror');
        console.log(e);
      };

      lc.onidpvalidationerror = (e) => {
        console.log('onidpvalidationerror');
        console.log(e);
      };

      lc.onnegotiationneeded = async (e) => {
        try {
          const offer2 = await lc.createOffer();
          console.log('onnegotiationneeded');
          await lc.setLocalDescription(offer2);
          await rc.setRemoteDescription(offer2);
          const answer2 = await rc.createAnswer();
          await rc.setLocalDescription(answer2);
          await lc.setRemoteDescription(answer2);
        } catch (err) {
          console.log(err);
        }
      };

      lc.onpeeridentity = (e) => {
        console.log('onpeeridentity');
        console.log(e);
      };

      lc.onremovestream = (e) => {
        console.log('onremovestream');
        console.log(e);
      };

      rc.onsignalingstatechange = (e) => {
        console.log('rc state:', rc.signalingState);
      };

      lc.onsignalingstatechange = (e) => {
        console.log('lc state:', lc.signalingState);
      };

      lc.ontrack = (e) => {
        console.log('ontrack');
        console.log(e);
      };

      // rc.ondatachannel = this.receiveChannelCallback;
      // lc.onicecandidate = (e) => {
      //   console.log('local on ice candidate');
      //   console.log(e.candidate);
      //   !e.candidate ||
      //     rc
      //       .addIceCandidate(e.candidate)
      //       .catch(handleAddCandidateError);
      // };

      // rc.onicecandidate = (e) => {
      //   console.log('remote on ice candidate');
      //   console.log(e.candidate);
      //   !e.candidate ||
      //     lc
      //       .addIceCandidate(e.candidate)
      //       .catch(handleAddCandidateError);
      // };

      const offer = await lc.createOffer();
      await lc.setLocalDescription(new RTCSessionDescription(offer));
      // note: pass the offer (localDescription) to the remote device
      // in order to connect via webrtc
      await rc.setRemoteDescription(
        new RTCSessionDescription(lc.localDescription),
      );
      const answer = await rc.createAnswer();
      await rc.setLocalDescription(new RTCSessionDescription(answer));
      await lc.setRemoteDescription(
        new RTCSessionDescription(rc.localDescription),
      );
      const channel = lc.createDataChannel('chat', null);
      window.channel = channel;
      channel.onopen = (e) => {
        console.log('channel opened');
        channel.send('Hi you!');
      };
      channel.onmessage = (e) => {
        console.log('message:');
        console.log(e.data);
      };

      console.log(offer);
      console.log(answer);
      window.lc = lc;
      window.rc = rc;
    } catch (err) {
      console.log(err);
    }
  };

  disconnectPeers = () => {
    // Close the RTCDataChannels if they're open

    sendChannel.close();
    receiveChannel.close();

    // Close the RTCPeerConnections

    lc.close();
    rc.close();

    sendChannel = null;
    receiveChannel = null;
    lc = null;
    rc = null;

    // Update user interface elements

    this.connectButton.disabled = false;
    this.disconnectButton.disabled = true;
    this.sendButton.disabled = true;
    this.messageInputBox.disabled = true;
    this.setState({ localMessage: '' });
  };
  handleSendChannelStatusChange = (event) => {
    console.log('here');
    if (sendChannel) {
      const { readyState } = sendChannel;
      if (readyState === 'open') {
        this.messageInputBox.disabled = false;
        this.messageInputBox.focus();
        this.sendButton.disabled = false;
        this.disconnectButton.disabled = false;
        this.connectButton.disabled = true;
      } else {
        this.messageInputBox.disabled = true;
        this.sendButton.disabled = true;
        this.connectButton.disabled = true;
        this.disconnectButton.disabled = true;
      }
    }
  };
  receiveChannelCallback = (event) => {
    console.log('here');
    receiveChannel = event.channel;
    receiveChannel.onmessage = this.handleReceiveMessage;
    receiveChannel.onopen = handleRecieveChannelStatusChange;
  };
  handleReceiveMessage = (event) => {
    this.setState({
      remoteMessage: event.data,
    });
  };
  handleLocalAddCandidateSuccess = () => {
    this.setState({ localSuccess: true });
  };
  handleRemoteAddCandidateSuccess = () => {
    this.setState({ remoteSuccess: true });
  };
  handleSendMessage = () => {
    const { localMessage } = this.state;
    sendChannel.send(localMessage);
    this.messageInputBox.focus();
    this.setState({ localMessage: '' });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="connect-buttons">
          {/* {this.state.qrcode} */}
          <div
            className="qrcode"
            dangerouslySetInnerHTML={{ __html: this.state.qrcode }}
          />
          <button
            id="connectButton"
            name="connectButton"
            ref={(node) => (this.connectButton = node)}
            className="btn btn-success buttonleft"
            onClick={this.connectPeers}
          >
            Connect
          </button>
          <button
            id="disconnectButton"
            name="disconnectButton"
            ref={(node) => (this.disconnectButton = node)}
            className="btn btn-danger buttonright"
            onClick={this.disconnectPeers}
            disabled
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
              ref={(node) => (this.messageInputBox = node)}
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
              disabled
            />
          </label>
          <button
            id="sendButton"
            name="sendButton"
            className="buttonright"
            disabled
            ref={(node) => (this.sendButotn = node)}
            onClick={this.handleSendMessage}
          >
            Send
          </button>
        </div>
        <div className="messagebox" id="receivebox">
          <p>Messages received:</p>
          <p>{this.state.remoteMessage}</p>
        </div>
      </div>
    );
  }
}

export default App;
