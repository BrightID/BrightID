// @flow

import io from 'socket.io-client';
import { fetchData } from './fetchData';

export const setUpWs = () => (dispatch: () => null, getState: () => {}) => {
  let {
    connectQrData: { ipAddress, uuid, user },
  } = getState().main;

  user = user === 1 ? 2 : 1;

  // uuid += user;

  // const socket = io.connect(`${ipAddress}/profile`);
  // ipAddress = '127.0.0.1:3000';
  const socket = io.connect(`http://${ipAddress}`);

  socket.emit('join', uuid + 1);
  socket.emit('join', uuid + 2);

  console.log(uuid);

  socket.on('signals', () => {
    console.log('signals');
    dispatch(fetchData());
  });

  return socket;
};
