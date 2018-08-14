// @flow

/**
 * redux-thunk actions for handling webrtc data and signal server api
 * ===================================================================
 */

import { post } from 'axios';

import {
  setConnectPublicKey,
  setConnectTimestamp,
  setConnectNameornym,
  setConnectAvatar,
  setConnectTrustScore,
  setRtcId,
  setArbiter,
} from '../../actions';

/**
 * constants
 * ===================
 */
export const PORT = '3001';
export const ALPHA = 'ALPHA';
export const ZETA = 'ZETA';
export const ICE_CANDIDATE = 'ICE_CANDIDATE';
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
    // parse message with json
    console.log('parsing json');
    const msg = JSON.parse(data);
    console.log(msg);
    const { timestamp } = getState().main;
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
    if (msg && msg.trustCore) {
      dispatch(setConnectTrustScore(msg.trustScore));
      // send recieve message
      channel.send(JSON.stringify({ msg: recievedMessages.trustScore }));
    }
    // only set timestamp if this is user b
    if (!timestamp && msg && msg.timestamp) {
      dispatch(setConnectTimestamp(msg.timestamp));
      channel.send(JSON.stringify({ msg: recievedMessages.timestamp }));
    }

    console.log(msg);
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
    const res = await fetch(`http://localhost:${PORT}/id`);
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
    dispatch(setArbiter(arbiter));

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
    // set rtcId
    const { rtcId } = getState().main;
    console.log(rtcId);
    // attempt to fetch arbiter
    const { data } = await post(`http://localhost:${PORT}/update`, {
      rtcId,
      person,
      type,
      value,
    });
    // handle error
    if (data.error) {
      console.log('error UPDATING arbiter');
      console.log(data.msg);
      console.log(data.error);
      return data;
    }
    const { arbiter } = data;
    console.log(arbiter);
    // update redux store
    // ONLY UPDATE REDUX STORE VIA SOCKET IO
    dispatch(setArbiter(arbiter));

    // finish async api call
    return arbiter;
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
    const { rtcId } = getState().main;

    // fetch arbiter from signaling server
    const { data } = await post(`http://localhost:${PORT}/dispatcher`, {
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
    dispatch(setArbiter(arbiter));
    // finish async api call
    return arbiter;
  } catch (err) {
    console.log(err);
  }
};
