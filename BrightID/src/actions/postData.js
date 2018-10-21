// @flow

export const postData = (data: string) => async (_, getState: () => {}) => {
  try {
    let { ipAddress, uuid, user } = getState().main.connectQrData;

    // change this for production
    ipAddress = '127.0.0.1:3000';
    const response = await fetch(`http://${ipAddress}/upload`, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify({ data, uuid: uuid + user }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .catch((err) => console.log(err));
    console.log(response);
  } catch (err) {
    console.log(err);
  }
};
