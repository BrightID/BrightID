import { decryptData } from './decryptData';

// @flow

export const fetchData = () => async (
  dispatch: () => null,
  getState: () => {},
) => {
  try {
    let { ipAddress, uuid, user } = getState().main.connectQrData;

    // change this for production
    ipAddress = '127.0.0.1:3000';
    // UNCOMMENT THIS LINE
    user = user === 1 ? 2 : 1;
    const { data } = await fetch(`http://${ipAddress}/download/${uuid + user}`)
      .then((res) => res.json())
      .catch((err) => console.log(err));

    if (data) dispatch(decryptData(data));
  } catch (err) {
    console.log(err);
  }
};
