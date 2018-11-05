// @flow

import io from 'socket.io-client';

export const setUpWs = () => (dispatch: () => null, getState: () => {}) => {
  let {
    connectQrData: { ipAddress, uuid, user },
  } = getState();
  user = user === 1 ? 2 : 1;
  uuid += user;
  const socket = () => io.connect(`${ipAddress}`);

  socket().emit('join', uuid);
};
