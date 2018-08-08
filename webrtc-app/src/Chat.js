// @flow

import React, { Component } from 'react';
import nacl from 'tweetnacl';
import { connect } from 'react-redux';
import { resetUserB, setUserBRtcId, setUserBDispatcher } from './actions';
import {
  fetchDispatcher,
  update,
  ZETA,
  ANSWER,
  ICE_CANDIDATE,
} from './actions/api';
import logging from './utils/logging';
import { socket } from './websockets';

type Props = {
  dispatch: Function,
  channel: {},
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
    const { channel, user, publicKey } = this.props;
    const { messages } = this.state;
    if (channel) {
      channel.onmessage = (e) => {
        // parse data
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
      // send nameornym
      const nameornym = JSON.stringify({ nameornym: user });
      channel.send(nameornym);
      // send public key
      const pk = JSON.stringify({ publicKey });
      channel.send(pk);
      // if user A send timestamp
      if (user === 'UserA') {
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
    if (channel) channel.send(message);
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
