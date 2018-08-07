// @flow

import io from 'socket.io-client';

export const socket = () => io.connect('http://localhost:3001/signal');

export const signal = (rtcId) => {
  socket().emit('join', rtcId);
  return socket;
};
