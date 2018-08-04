import React, { Component } from 'react';
import nacl from 'tweetnacl';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import { setKeys } from './actions';

class ScanQR extends Component {
  render() {
    return (
      <div className="device">
        <header className="device-header">{this.props.user}</header>
        <div className="device-main">
          <button type="button" className="btn btn-success">
            Start
          </button>
        </div>
      </div>
    );
  }
}

export default connect()(ScanQR);
