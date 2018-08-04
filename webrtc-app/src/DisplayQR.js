// @flow

import React, { Component } from 'react';
// import nacl from 'tweetnacl';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import { createRTCId } from './actions/api';
import { resetStore } from './actions';

type Props = {
  rtcId: string,
  dispatch: () => Promise,
};

class DisplayQR extends Component<Props> {
  state = {
    qrcode: '',
  };

  async componentDidMount() {
    // fetch rtc id from signaling server
    const { dispatch } = this.props;
    const rtcId = await dispatch(createRTCId());
    console.log(rtcId);
    this.genQrCode();
  }

  componentDidUpdate(prevProps) {
    // generate a new qrcode if the rtcId value changes
    const { rtcId } = this.props;
    if (prevProps.rtcId !== rtcId) {
      this.genQrCode();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(resetStore());
  }

  genQrCode = () => {
    const { rtcId } = this.props;
    if (rtcId) {
      qrcode.toString(rtcId, (err, data) => {
        if (err) throw err;
        this.setState({
          qrcode: data,
        });
      });
    }
  };

  render() {
    const { rtcId } = this.props;
    return (
      <div className="qrcode-screen">
        <div
          className="qrcode"
          dangerouslySetInnerHTML={{ __html: this.state.qrcode }}
        />
        {rtcId}
      </div>
    );
  }
}

export default connect((s) => s.userA)(DisplayQR);
