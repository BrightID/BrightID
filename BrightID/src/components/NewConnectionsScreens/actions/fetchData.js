import { decryptData } from './decryptData';
import emitter from '../../../emitter';

// @flow

export const fetchData = () => (dispatch: () => null, getState: () => {}) => {
  let { ipAddress, uuid, user } = getState().main.connectQrData;

  // ipAddress = '127.0.0.1:3000';
  // ipAddress = 'test.brightid.org';
  user = user === 1 ? 2 : 1;
  uuid += user;

  console.log(`fetching data for ${user}`);

  fetch(`http://${ipAddress}/profile/download/${uuid}`)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.data) {
        dispatch(decryptData(data.data));
      } else {
        emitter.emit('connectFailure');
        throw new Error("Empty 'data' returned from profile download.");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
