// @flow

import io from 'socket.io-client';
import { fetchData } from './fetchData';

export const setUpWs = () => (
  dispatch: (() => null) => null,
  getState: () => {
    main: {
      connectQrData: {
        ipAddress: string,
        uuid: string,
        channel: string,
      },
    },
  },
) => {
  let { ipAddress, channel } = getState().main.connectQrData;

  const socket = io.connect(`http://${ipAddress}`);

  socket.emit('join', channel);

  console.log(`Joined channel: ${channel}`);

  socket.on('signals', () => {
    console.log('signals');
    dispatch(fetchData());
  });

  return socket;
};
