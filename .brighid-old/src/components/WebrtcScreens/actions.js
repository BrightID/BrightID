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

import { objToUint8 } from '../../utils/objToUint8';

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
