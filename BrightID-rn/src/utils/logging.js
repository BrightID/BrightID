/* eslint no-param-reassign:off */

export default function logging(connection, type) {
  connection.onsignalingstatechange = () => {
    if (connection)
      console.warn(`${type} signaling state:`, connection.signalingState);
  };

  connection.oniceconnectionstatechange = () => {
    if (connection)
      console.warn(
        `${type} ice connection state: `,
        connection.iceConnectionState,
      );
  };

  connection.onicegatheringstatechange = () => {
    if (connection)
      console.warn(
        `${type} ice gathering state: `,
        connection.iceGatheringState,
      );
  };

  connection.onaddstream = (e) => {
    console.warn('onaddstream');
    console.warn(e);
  };

  connection.onconnectionstatechange = (e) => {
    console.warn('onaddstream');
    console.warn(e);
  };

  connection.onidentityresult = (e) => {
    console.warn('onidentityresult');
    console.warn(e);
  };

  connection.onidpassertionerror = (e) => {
    console.warn('onidpassertionerror');
    console.warn(e);
  };

  connection.onidpvalidationerror = (e) => {
    console.warn('onidpvalidationerror');
    console.warn(e);
  };

  connection.onpeeridentity = (e) => {
    console.warn('onpeeridentity');
    console.warn(e);
  };

  connection.onremovestream = (e) => {
    console.warn('onremovestream');
    console.warn(e);
  };

  connection.ontrack = (e) => {
    console.warn('ontrack');
    console.warn(e);
  };

  connection.onnegotiationneeded = async () => {
    try {
      // const offer2 = await lc.createOffer();
      console.warn('onnegotiationneeded');
      // await lc.setLocalDescription(offer2);
      // await rc.setRemoteDescription(offer2);
      // const answer2 = await rc.createAnswer();
      // await rc.setLocalDescription(answer2);
      // await lc.setRemoteDescription(answer2);
    } catch (err) {
      console.warn(err);
    }
  };
}
