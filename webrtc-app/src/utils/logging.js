/* eslint no-param-reassign:off */

export default function logging(connection, type) {
  connection.onsignalingstatechange = () => {
    if (connection) console.log(`${type} state:`, connection.signalingState);
  };

  connection.oniceconnectionstatechange = () => {
    if (connection) console.log(`${type}: `, connection.iceConnectionState);
  };

  connection.onicegatheringstatechange = () => {
    if (connection) console.log(`${type}: `, connection.iceGatheringState);
  };

  connection.onaddstream = (e) => {
    console.log('onaddstream');
    console.log(e);
  };

  connection.onconnectionstatechange = (e) => {
    console.log('onaddstream');
    console.log(e);
  };

  connection.onidentityresult = (e) => {
    console.log('onidentityresult');
    console.log(e);
  };

  connection.onidpassertionerror = (e) => {
    console.log('onidpassertionerror');
    console.log(e);
  };

  connection.onidpvalidationerror = (e) => {
    console.log('onidpvalidationerror');
    console.log(e);
  };

  connection.onpeeridentity = (e) => {
    console.log('onpeeridentity');
    console.log(e);
  };

  connection.onremovestream = (e) => {
    console.log('onremovestream');
    console.log(e);
  };

  connection.ontrack = (e) => {
    console.log('ontrack');
    console.log(e);
  };

  connection.onnegotiationneeded = async () => {
    try {
      // const offer2 = await lc.createOffer();
      console.log('onnegotiationneeded');
      // await lc.setLocalDescription(offer2);
      // await rc.setRemoteDescription(offer2);
      // const answer2 = await rc.createAnswer();
      // await rc.setLocalDescription(answer2);
      // await lc.setRemoteDescription(answer2);
    } catch (err) {
      console.log(err);
    }
  };
}
