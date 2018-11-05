// @flow

import io from 'socket.io-client';
import { fetchData } from './fetchData';

export const setUpWs = () => (dispatch: () => null, getState: () => {}) => {
  let {
    connectQrData: { ipAddress, uuid, user },
  } = getState().main;
  user = user === 1 ? 2 : 1;
  uuid += user;
  // ipAddress = '127.0.0.1';
  const socket = io.connect(`${ipAddress}/profile`);

  socket.emit('join', uuid);
  socket.on('upload', (val) => {
    if (val === 'ready') {
      dispatch(fetchData());
    }
  });

  socket.on('signals', () => {
    dispatch(fetchData());
  });

  return socket;
};
