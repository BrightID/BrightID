// @flow

export const postData = (data: string) => async (_, getState: () => {main: {connectQrData: {}}}) => {

  let { ipAddress, uuid, user } = getState().main.connectQrData;

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
