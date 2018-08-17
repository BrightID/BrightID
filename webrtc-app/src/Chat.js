// @flow

import React, { Component } from 'react';
import { handleRecievedMessage } from './webrtc';
/**
 * This component handles webrtc messaging
 * it sends the timestamp, publickey,
 */

type Props = {
  channel: {},
  user: string,
  publicKey: Uint8Array,
  dispatch: Function,
};

class Chat extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      messages: [],
      publicKey2: '',
    };
  }

  componentWillMount() {
    const { channel, user, publicKey, dispatch } = this.props;
    const { messages } = this.state;
    if (channel) {
      channel.onmessage = (e) => {
        // parse data
        dispatch(handleRecievedMessage(e.data, channel));
        const msg = JSON.parse(e.data);
        // public key is too long to display
        if (!msg.publicKey) {
          messages.push(msg);
        } else {
          messages.push('[publicKey]');
          // save public key 2 locally to encrypt message
          this.setState({
            publicKey2: msg.publicKey,
          });
        }

        this.setState({ messages });
      };
      // channel metrics

      // console.log(`id ${channel.id}`);
      // console.log(`binaryType ${channel.binaryType}`);
      // console.log(
      //   `bufferedAmountLowThreshold ${channel.bufferedAmountLowThreshold}`,
      // );
      // console.log(`maxPacketLifeTime ${channel.maxPAcketLifeTime}`);
      // console.log(`maxRetransmits ${channel.maxRetransmits}`);
      // console.log(`negotiated ${channel.negotiated}`);
      // console.log(`ordered ${channel.ordered}`);
      // console.log(`protocol ${channel.protocol}`);
      // console.log(`readyState ${channel.readyState}`);
      // send nameornym
      const nameornym = JSON.stringify({ nameornym: user });
      channel.send(nameornym);
      // send public key
      const pk = JSON.stringify({ publicKey });
      channel.send(pk);
      // if user B send timestamp
      if (user === 'UserB') {
        const timestamp = JSON.stringify({
          timestamp: Date.now(),
        });
        channel.send(timestamp);
      }
    }
  }

  sendMessage = () => {
    const { value } = this.state;
    const { channel } = this.props;
    const message = JSON.stringify({ msg: value });
    if (channel && channel.readyState === 'open') {
      console.log('before send');
      console.log(`bufferedAmount ${channel.bufferedAmount}`);
      channel.send(message);
      console.log('after send');
      console.log(`bufferedAmount ${channel.bufferedAmount}`);
    }
  };

  render() {
    const { messages } = this.state;
    return (
      <div className="qrcode-screen">
        <div className="scan-text">send message</div>
        <div className="qr-input">
          <input
            type="text"
            className="form-control"
            placeholder=""
            value={this.state.value}
            onChange={(e) => {
              this.setState({ value: e.target.value });
            }}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                this.sendMessage();
                e.target.blur();
                this.setState({
                  value: '',
                });
              }
            }}
          />
        </div>
        {messages.map((val, index) => (
          <div key={val + index}>{JSON.stringify(val)}</div>
        ))}
      </div>
    );
  }
}

export default Chat;
