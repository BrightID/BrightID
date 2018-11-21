import { decryptData } from './decryptData';

// @flow

export const fetchData = () => (dispatch: () => null, getState: () => {}) => {
  try {
    let { ipAddress, uuid, user } = getState().main.connectQrData;

    // change this for production
    ipAddress = '127.0.0.1:3000';
    user = user === 1 ? 2 : 1;
    uuid += user;

    console.log('fetching data');
    fetch(`http://${ipAddress}/profile/download/${uuid}`)
      .then((res) => res.json())
      .then(({ data }) => {
        console.log(data);
        if (data) dispatch(decryptData(data));
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
  }
};
