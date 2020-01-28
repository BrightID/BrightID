// @flow

export const postData = (data: string) => async (
  _: dispatch,
  getState: getState,
) => {
  let { ipAddress, uuid, user } = getState().connectQrData;

  fetch(`http://${ipAddress}/profile/upload`, {
    method: 'POST', // or 'PUT'
    body: JSON.stringify({ data, uuid: uuid + user }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      if (res.status === 200) {
        console.log('successfully uploaded data');
      }
    })
    .catch((err) => {
      err instanceof Error ? console.warn(err.message) : console.log(err);
    });
};
