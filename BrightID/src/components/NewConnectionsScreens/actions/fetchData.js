import { decryptData } from './decryptData';
import emitter from '../../../emitter';

// @flow

export const fetchData = (alertErrors = true) => (
  dispatch: () => null,
  getState: () => {},
) => {
  let { ipAddress, channel } = getState().connectQrData.myQrData;
  if (!channel) return;

  console.log(`fetching data for channel ${channel}`);

  const url = `http://${ipAddress}/profile/download/${channel}`;

  let response;

  fetch(url)
    .then(async (res) => {
      response = await res;
      if (response.ok) {
        return res.json();
      } else {
        throw new Error(
          `Profile download returned ${response.status}:` +
            `${response.statusText} for url: ${url}`,
        );
      }
    })
    .then((data) => {
      if (data && data.data) {
        response.profileData = data.data;
        emitter.emit('recievedProfileData');
        dispatch(decryptData(data.data));
      }
    })
    .catch((err) => {
      if (alertErrors) {
        let message = `Profile download attempt from url: ${url}
      Response from profile download: ${JSON.stringify(response)}
      Stack trace: ${err.stack}`;
        console.log(message);
      }
      emitter.emit('connectFailure');
    });
};
