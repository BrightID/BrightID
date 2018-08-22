// @flow

/**
 * redux-thunk actions for handling webrtc data and signal server api
 * ===================================================================
 */

import { post } from 'axios';
import nacl from 'tweetnacl';

import {
  setConnectPublicKey,
  setConnectTimestamp,
  setConnectNameornym,
  setConnectAvatar,
  setConnectTrustScore,
  setRtcId,
  setArbiter,
  setBoxKeypair,
} from './actions/mobile';

import { setUserAArbiter, setUserBArbiter } from './actions';

/**
 * constants
 * ===================
 */

export const ICE_SERVERS = {
  iceServers: [
    { url: 'stun:signal.hotlinebling.space' },
    {
      url: 'turn:signal.hotlinebling.space',
      username: 'trident',
      credential: 'flamethrower',
    },
  ],
};
export const URL = 'https://signal.hotlinebling.space'; // place your url here
export const ALPHA = 'ALPHA';
export const ZETA = 'ZETA';
export const ICE_CANDIDATE = 'ICE_CANDIDATE';
export const PUBLIC_KEY = 'PUBLIC_KEY';
export const OFFER = 'OFFER';
export const ANSWER = 'ANSWER';
export const recievedMessages = {
  publicKey: 'recieved public key',
  trustScore: 'recieved trust score',
  nameornym: 'received nameornym',
  avatar: 'received avatar',
  timestamp: 'received timestamp',
};

/**
 * handle webrtc messages recieved
 * ======================================
 */

export const handleRecievedMessage = (
  data: string,
  channel: { send: Function },
) => async (dispatch: Function, getState: Function) => {
  try {
    if (channel && channel.readyState === 'open') {
      // parse message with json
      const msg = JSON.parse(data);

      const { timestamp } = getState().userA || getState().userB;
      // update redux store based on message content

      // set public key
      if (msg && msg.publicKey) {
        dispatch(
          setConnectPublicKey(new Uint8Array(Object.values(msg.publicKey))),
        );
        // send recieve message
        channel.send(JSON.stringify({ msg: recievedMessages.publicKey }));
      }
      // set nameornym
      if (msg && msg.nameornym) {
        dispatch(setConnectNameornym(msg.nameornym));
        // send recieve message
        channel.send(JSON.stringify({ msg: recievedMessages.nameornym }));
      }
      // set avatar
      if (msg && msg.avatar) {
        dispatch(setConnectAvatar(msg.avatar));
        // send recieve message
        channel.send(JSON.stringify({ msg: recievedMessages.avatar }));
      }
      // set trust score
      if (msg && msg.trustScore) {
        dispatch(setConnectTrustScore(msg.trustScore));
        // send recieve message
        channel.send(JSON.stringify({ msg: recievedMessages.trustScore }));
      }
      // only set timestamp if this is the user displaying qr code
      if (!timestamp && msg && msg.timestamp) {
        dispatch(setConnectTimestamp(msg.timestamp));
        channel.send(JSON.stringify({ msg: recievedMessages.timestamp }));
      }

      console.log(msg);
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * signaling api
 * ===================
 */

export const createRTCId = () => async (dispatch: Function) => {
  try {
    const res = await fetch(`${URL}/id`);
    const { rtcId, arbiter } = await res.json();

    // simulate network delay
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });

    // update redux store
    dispatch(setRtcId(rtcId));
    // only userA initializes creation an RTC Id
    dispatch(setUserAArbiter(arbiter));

    // return rtcId to component letting it know api fetch is successful
    return new Promise((resolve) => {
      resolve(rtcId);
    });
  } catch (err) {
    console.log(err);
  }
};

export const update = ({ type, person, value }) => async (
  dispatch: Function,
  getState: Function,
) => {
  try {
    // action recieves type, person, and value to update the signaling server arbiter

    const { rtcId } = getState().userA || getState().userB;
    // in the future lets encrypt all data
    let box = value;

    // attempt to update and fetch new arbiter
    const { data } = await post(`${URL}/update`, {
      rtcId,
      person,
      type,
      box,
    });
    // handle error
    if (data.error) {
      console.log('error UPDATING arbiter');
      console.log(data.msg);
      console.log(data.error);
      return data;
    }
    // new arbiter should exist inside of the data object
    console.log(data.arbiter);
    // update redux store
    // ONLY UPDATE REDUX STORE VIA SOCKET IO
    // dispatch(setArbiter(data.arbiter));

    // finish async api call by returning the new arbiter
    return data.arbiter;
  } catch (err) {
    console.log(err);
  }
};

export const fetchArbiter = () => async (
  dispatch: Function,
  getState: Function,
) => {
  try {
    // obtain rtcId from redux store - which is the source of truth
    const { rtcId } = getState().userA || getState().userB;

    // fetch arbiter from signaling server
    const { data } = await post(`${URL}/dispatcher`, {
      rtcId,
    });
    // handle error
    if (data.error) {
      console.log('error updating arbiter');
      console.log(data.msg);
      console.log(data.error);
      return data;
    }

    const { arbiter } = data;

    // update redux store
    dispatch(setUserBArbiter(arbiter));
    // finish async api call
    return arbiter;
  } catch (err) {
    console.log(err);
  }
};

/**
 * create nacl messaging box keypair
 * ======================================
 */

export const createKeypair = () => (dispatch: Function) => {
  // create box keypair
  const keypair = nacl.box.keyPair();
  dispatch(setBoxKeypair(keypair));
  return keypair;
};

/**
 * FOR FUTURE USE
 * ENCRYPT DATA THEN UPDATE
 */

// export const update = ({ type, person, value }) => async (
//   dispatch: Function,
//   getState: Function,
// ) => {
//   try {
//     // action recieves type, person, and value to update the signaling server arbiter

//     const { rtcId, connectBoxKeypair, arbiter } = getState().userA || getState().userB;
//     console.log(rtcId);

//     /**
//      * in order to encrypt box - we must have the other user's public key - which is stored in the arbiter - if we are updating the ALPHA arbiter, then the other key is stored in ZETA arbiter, and vice versa - if we are setting our own public key in the arbiter, we do not encrypt the message - otherwise, all other messages will be encrypted for security
//      */

//     let box;
//     let { publicKey } = type === 'ALPHA' ? arbiter[ZETA] : arbiter[ALPHA];

//     // encrypt value msg
//     if (typeof value === 'string' && publicKey) {
//       box = nacl.box(
//         value,
//         publicKey,
//         connectBoxKeypair.nonce,
//         connectBoxKeypair.secretKey,
//       );
//     } else if (type === PUBLIC_KEY) {
//       box = value;
//     } else {
//       box = value;
//     }
//     // attempt to update and fetch new arbiter
//     const { data } = await post(`${URL}/update`, {
//       rtcId,
//       person,
//       type,
//       box,
//     });
//     // handle error
//     if (data.error) {
//       console.log('error UPDATING arbiter');
//       console.log(data.msg);
//       console.log(data.error);
//       return data;
//     }
//     // new arbiter should exist inside of the data object
//     console.log(data.arbiter);
//     // update redux store
//     // ONLY UPDATE REDUX STORE VIA SOCKET IO
//     dispatch(setArbiter(data.arbiter));

//     // finish async api call by returning the new arbiter
//     return data.arbiter;
//   } catch (err) {
//     console.log(err);
//   }
// };

// export const sendMessage = (
//   data: string,
//   channel: { send: Function },
// ) => async (dispatch: Function, getState: Function) => {
//   try {
//     if (channel && channel.readyState === 'open') {
//       // fragments messages into chunks of 600 bytes and converts message into Uint8Array
//       const messages = fragment(data);
//       console.warn(messages);
//       let sendTime = 0;
//       for (let m of messages) {
//         // stagger sending messages by 200 ms
//         setTimeout(() => {
//           channel.send(JSON.stringify(m));
//         }, sendTime);
//         sendTime += 200;
//       }
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };
