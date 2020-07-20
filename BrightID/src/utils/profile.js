// @flow

export const postProfileToChannel = async (data: string, channel: Channel) => {
  let { ipAddress, id } = channel;
  const url = `http://${ipAddress}/profile/upload/${id}`;
  const body = JSON.stringify({ data, uuid: channel.myProfileId });
  console.log(
    `posting profile ${channel.myProfileId} to channel ${id} at ${url}`,
  );
  await postData(url, body);
};

/*
  Posts the signed connection message (AddConnection "me"->"peer") to peers personal channel.
  The UUID is my profileId on the group channel, so peer knows which profile to download in order
  to confirm and make connection.
  data contains:
   - signedMessage
   - timestamp when signedMessage was created
 */
export const postConnectionRequest = async (
  data: any,
  ipAddress: string,
  peerProfileId: string,
  myProfileId: string,
) => {
  const url = `http://${ipAddress}/profile/upload/${peerProfileId}`;
  const body = JSON.stringify({ data, uuid: myProfileId });
  console.log(
    `posting connection request with UUID ${myProfileId} to channel ${peerProfileId} at ${url}`,
  );
  await postData(url, body);
};

const postData = async (url: string, body: string) => {
  try {
    const result = await fetch(url, {
      method: 'POST', // or 'PUT'
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (result.status === 200 || result.status === 201) {
      console.log('successfully uploaded data');
    } else {
      throw Error(`Unexpected http status ${result.status}`);
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
