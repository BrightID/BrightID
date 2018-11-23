import { decryptData } from './decryptData';

// @flow

export const fetchData = () => async (
  dispatch: () => null,
  getState: () => {},
) => {
  try {
    let { ipAddress, uuid, user } = getState().main.connectQrData;

    // ipAddress = '127.0.0.1:3000';
    user = user === 1 ? 2 : 1;
    uuid += user;

    console.log(`fetching data for ${user}`);

    const res = await fetch(`http://${ipAddress}/profile/download/${uuid}`);
    const { data } = res.json();
    if (data) dispatch(decryptData(data));
  } catch (err) {
    console.log(err);
  }
};
