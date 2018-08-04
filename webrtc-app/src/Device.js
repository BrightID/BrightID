// @flow

import React, { Component } from 'react';
import nacl from 'tweetnacl';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import { setKeys } from './actions';
import DisplayQR from './DisplayQR';

type Props = {
  user: string,
};

class Device extends Component<Props> {
  state = {
    start: false,
  };

  renderScreen = () => {
    const { user } = this.props;
    const { start } = this.state;

    if (user === 'UserA' && start) {
      return <DisplayQR />;
    }

    if (user === 'UserB' && start) {
      return null;
    }
  };

  renderBackButton = () => {
    const { start } = this.state;
    if (start) {
      return (
        <button
          type="button"
          className="btn  back-button"
          onClick={() => {
            this.setState({ start: false });
          }}
        >
          Back
        </button>
      );
    }
  };

  renderStartButton = () => {
    const { start } = this.state;
    if (!start) {
      return (
        <button
          type="button"
          className="btn btn-success"
          onClick={() => {
            this.setState({ start: true });
          }}
        >
          Start
        </button>
      );
    }
  };

  render() {
    return (
      <div className="device">
        <header className="device-header">{this.props.user}</header>
        {this.renderBackButton()}
        <div className="device-main">
          {this.renderStartButton()}
          {this.renderScreen()}
        </div>
      </div>
    );
  }
}

export default connect()(Device);
