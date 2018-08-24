// @flow

import React, { Component } from 'react';
import nacl from 'tweetnacl';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import { setKeys } from './actions';
import DisplayQR from './DisplayQR';
import ScanQR from './ScanQR';
import {
  setUserAName,
  setUserBName,
  setUserATrustScore,
  setUserBTrustScore,
} from './actions';

type Props = {
  user: string,
};

class Device extends Component<Props> {
  state = {
    start: false,
  };

  goBackBack = () => {
    this.setState({
      start: false,
    });
  };

  renderScreen = () => {
    const { user } = this.props;
    const { start } = this.state;

    if (user === 'UserA' && start) {
      return <DisplayQR goBackBack={this.goBackBack} />;
    }

    if (user === 'UserB' && start) {
      return <ScanQR goBackBack={this.goBackBack} />;
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            flexDirection: 'column',
            height: 200,
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="enter name"
            onChange={(e) => {
              const { dispatch, user } = this.props;
              if (user === 'UserA') {
                dispatch(setUserAName(e.target.value));
              } else {
                dispatch(setUserBName(e.target.value));
              }
            }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="enter trust score"
            onChange={(e) => {
              const { dispatch, user } = this.props;
              if (user === 'UserA') {
                dispatch(setUserATrustScore(e.target.value));
              } else {
                dispatch(setUserBTrustScore(e.target.value));
              }
            }}
          />
          <div>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                this.setState({ start: true });
              }}
            >
              Start
            </button>
          </div>
        </div>
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
