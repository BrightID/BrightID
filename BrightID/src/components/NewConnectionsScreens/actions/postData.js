// @flow

export const postData = (data: string) => async (_, getState: () => {}) => {
  try {
    let { ipAddress, uuid, user } = getState().main.connectQrData;
    // change this for production
    // ipAddress = '127.0.0.1:3000';
    const res = await fetch(`http://${ipAddress}/profile/upload`, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify({ data, uuid: uuid + user }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(res.json());
  } catch (err) {
    console.log(err);
  }
};
