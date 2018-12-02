import { decryptData } from './decryptData';

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
      if (data) {
        dispatch(decryptData(data));
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
