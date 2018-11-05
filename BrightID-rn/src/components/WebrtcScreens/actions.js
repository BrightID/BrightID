// @flow

/**
 * redux-thunk actions for handling webrtc data and signal server api
 * ===================================================================
 */

import nacl from 'tweetnacl';
import { post } from 'axios';
import { URL } from './signalApi';
import {
  setConnectPublicKey,
  setConnectTimestamp,
  setConnectNameornym,
  setConnectAvatar,
  setConnectTrustScore,
  setConnectRecievedTimestamp,
  setConnectRecievedPublicKey,
  setConnectRecievedTrustScore,
  setConnectRecievedNameornym,
  setConnectRecievedAvatar,
  setBoxKeypair,
} from '../../actions';

import { objToUint8 } from '../../utils/encoding';
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

export const confirmation = {
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
  channel: { send: () => null },
) => async (dispatch: () => null, getState: () => null) => {
  try {
    if (channel && channel.readyState === 'open') {
      // parse message with json
      const msg = JSON.parse(data);
      console.log(msg);
      const { timestamp } = getState().main;
      // update redux store based on message content

      /**
       * Handle recieving connection content from other user
       * after recieving each message, we store the content
       * inside of the redux store, and we reply to the sender
       * with a confirmation message
       */

      // set public key
      if (msg && msg.publicKey) {
        dispatch(
          // convert public key to Uint8Array
          setConnectPublicKey(objToUint8(msg.publicKey)),
        );
        // send recieve message
        channel.send(JSON.stringify({ msg: confirmation.publicKey }));
      }
      // set nameornym
      if (msg && msg.nameornym) {
        dispatch(setConnectNameornym(msg.nameornym));
        // send recieve message
        channel.send(JSON.stringify({ msg: confirmation.nameornym }));
      }
      // set avatar
      if (msg && msg.avatar) {
        dispatch(setConnectAvatar(msg.avatar));
        // send recieve message
        channel.send(JSON.stringify({ msg: confirmation.avatar }));
      }
      // set trust score
      if (msg && msg.trustScore) {
        dispatch(setConnectTrustScore(msg.trustScore));
        // send recieve message
        channel.send(JSON.stringify({ msg: confirmation.trustScore }));
      }
      // only set timestamp if this is the user displaying qr code
      if (!timestamp && msg && msg.timestamp) {
        dispatch(setConnectTimestamp(msg.timestamp));
        channel.send(JSON.stringify({ msg: confirmation.timestamp }));
      }

      /**
       * Handle recieving confirmation messages
       * upon recieving each confirmation message,
       * update the redux store
       */

      if (msg && msg.msg) {
        if (msg.msg === confirmation.timestamp) {
          dispatch(setConnectRecievedTimestamp());
        } else if (msg.msg === confirmation.publicKey) {
          dispatch(setConnectRecievedPublicKey());
        } else if (msg.msg === confirmation.trustScore) {
          dispatch(setConnectRecievedTrustScore());
        } else if (msg.msg === confirmation.nameornym) {
          dispatch(setConnectRecievedNameornym());
        } else if (msg.msg === confirmation.avatar) {
          dispatch(setConnectRecievedAvatar());
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * create nacl messaging box keypair
 * ======================================
 */

export const createKeypair = () => (dispatch: () => null) => {
  // create box keypair
  const keypair = nacl.box.keyPair();
  dispatch(setBoxKeypair(keypair));
  return keypair;
};

export const sendAvatar = () => async (
  dispatch: () => null,
  getState: () => null,
) => {
  const { userAvatar, rtcId } = getState().main;
  const { data } = await post(`${URL}/avatar`, {
    userAvatar,
    rtcId,
  });
};

/**
 * FOR FUTURE USE
 * ENCRYPT DATA THEN UPDATE
 */

// export const update = ({ type, person, value }) => async (
//   dispatch: () => null,
//   getState: () => null,
// ) => {
//   try {
//     // action recieves type, person, and value to update the signaling server arbiter

//     const { rtcId, connectBoxKeypair, arbiter } = getState().main;
//     console.log(rtcId);

//     /**
//      * in order to encrypt box - we must have the other user's public key - which is stored in the arbiter - if we are updating the USERA arbiter, then the other key is stored in USERB arbiter, and vice versa - if we are setting our own public key in the arbiter, we do not encrypt the message - otherwise, all other messages will be encrypted for security
//      */

//     let box;
//     let { publicKey } = type === 'USERA' ? arbiter[USERB] : arbiter[USERA];

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
//     const { data } = await post(`http://${URL}/update`, {
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
//   channel: { send: () => null },
// ) => async (dispatch: () => null, getState: () => null) => {
//   try {
//     if (channel && channel.readyState === 'open') {
//       // fragments messages into chunks of 600 bytes and converts message into Uint8Array
//       const messages = fragment(data);
//       console.log(messages);
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
