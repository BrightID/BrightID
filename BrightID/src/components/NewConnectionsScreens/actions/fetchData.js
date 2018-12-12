import { decryptData } from './decryptData';
import emitter from '../../../emitter';

// @flow

export const fetchData = () => (dispatch: () => null, getState: () => {}) => {
  let { ipAddress, uuid, channel } = getState().main.connectQrData;

  console.log(`fetching data for channel ${channel}`);

  fetch(`http://${ipAddress}/profile/download/${channel}`)
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
