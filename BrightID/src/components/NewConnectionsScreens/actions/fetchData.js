import { Alert } from 'react-native';
import { decryptData } from './decryptData';
import emitter from '../../../emitter';

// @flow

export const fetchData = () => (dispatch: () => null, getState: () => {}) => {
  let { ipAddress, channel } = getState().main.connectQrData;

  console.log(`fetching data for channel ${channel}`);

  const url = `http://${ipAddress}/profile/download/${channel}`;

  fetch(url)
    .then(async (res) => {
      const response = await res;
      if (response.ok) {
        return res.json();
      } else {
        throw new Error(`Profile download returned ${response.status}:`
         + `${response.statusText} for url: ${url}`);
      }
    })
    .then((data) => {
      if (data && data.data) {
        dispatch(decryptData(data.data));
      } else {
        emitter.emit('profileNotReady');
      }
    })
    .catch((err) => {
      Alert.alert(err.message || "Error", err.stack);
      return emitter.emit('connectFailure');
    });
};
