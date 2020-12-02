// @flow

import io from 'socket.io-client';

import { URL } from './webrtc';

export const socket = () => io.connect(`${URL}/signal`);

export const signal = (rtcId) => {
  socket().emit('join', rtcId);
  return socket;
};
