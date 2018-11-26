// @flow

export const postData = (data: string) => async (_, getState: () => {}) => {
  try {
    let { ipAddress, uuid, user } = getState().main.connectQrData;
    // change this for production
    // ipAddress = '127.0.0.1:3000';
    let res = await fetch(`http://${ipAddress}/profile/upload`, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify({ data, uuid: uuid + user }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    res = await res.json();
    console.log(res);
  } catch (err) {
    console.log(err);
  }
};
