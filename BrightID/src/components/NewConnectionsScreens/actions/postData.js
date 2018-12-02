// @flow

export const postData = (data: string) => (_, getState: () => {}) => {
  let { ipAddress, uuid, user } = getState().main.connectQrData;
  // change this for production
  // ipAddress = 'test.brightid.org';
  // ipAddress = '127.0.0.1:3000';

  fetch(`http://${ipAddress}/profile/upload`, {
    method: 'POST', // or 'PUT'
    body: JSON.stringify({ data, uuid: uuid + user }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      console.log(res.status);
    })
    .catch((err) => {
      console.log(err);
    });
};
