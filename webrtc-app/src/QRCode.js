import React, { Component } from 'react';
import nacl from 'tweetnacl';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import { setKeys } from './actions';

class QRCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keys: {},
      qrcode: '',
    };
  }

  async componentDidMount() {
    await this.genKeys();
    this.genQrCode();
  }

  genKeys = () => {
    const keys = nacl.sign.keyPair();
    this.props.dispatch(setKeys(keys));
    return new Promise((resolve) => {
      this.setState(
        {
          keys,
        },
        resolve,
      );
    });
  };

  genQrCode = () => {
    const { keys } = this.state;
    console.log(keys);
    if (keys.publicKey) {
      qrcode.toString(keys.publicKey.toString(), (err, data) => {
        if (err) throw err;
        this.setState({
          qrcode: data,
        });
      });
    }
  };

  handleClick = async () => {
    await this.genKeys();
    this.genQrCode();
  };

  render() {
    return (
      <div>
        <div className="qr-container">
          <div className="qr-label" onClick={this.handleClick}>
            <u>NaCl Public Key:</u>
          </div>
          <input
            type="text"
            name="public key"
            className="input-control pk-box"
            placeholder="Message text"
            value={this.props.publicKey}
            disabled
          />
          <div
            className="qrcode"
            dangerouslySetInnerHTML={{ __html: this.state.qrcode }}
          />
        </div>
      </div>
    );
  }
}

export default connect((s) => s)(QRCode);
