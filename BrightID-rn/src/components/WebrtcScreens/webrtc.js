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

/**
 * handle webrtc messages recieved
 * ======================================
 */

export const handleRecievedMessage = (data: string) => async (
  dispatch: Function,
  getState: Function,
) => {
  // parse message with json
  console.warn('parsing json');
  const msg = JSON.parse(data);
  console.warn(msg);
  const { timestamp } = getState().main;
  // update redux store based on message content

  // set public key
  if (msg.publicKey) {
    dispatch(setConnectPublicKey(new Uint8Array(Object.values(msg.publicKey))));
  }
  // set nameornym
  if (msg.nameornym) {
    dispatch(setConnectNameornym(msg.nameornym));
  }
  // only set timestamp if this is user b
  if (msg.timestamp && !timestamp) {
    dispatch(setConnectTimestamp(msg.timestamp));
  }

  console.warn(msg);
};

/**
 * signaling api
 * ===================
 */

export const createRTCId = () => async (dispatch: Function) => {
  try {
    const res = await fetch(`http://localhost:${PORT}/id`);
    const { rtcId, dispatcher } = await res.json();

    // simulate network delay
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });

    // update redux store
    dispatch(setRtcId(rtcId));
    // only userA initializes creation an RTC Id
    dispatch(setArbiter(dispatcher));

    // return rtcId to component letting it know api fetch is successful
    return new Promise((resolve) => {
      resolve(rtcId);
    });
  } catch (err) {
    throw err;
  }
};

export const update = ({ type, person, value }) => async (
  dispatch: Function,
  getState: Function,
) => {
  try {
    // set rtcId
    const { rtcId } = getState().main;
    console.warn(rtcId);
    // attempt to fetch dispatcher
    const { data } = await post(`http://localhost:${PORT}/update`, {
      rtcId,
      person,
      type,
      value,
    });
    // handle error
    if (data.error) {
      console.warn('error updating dispatcher');
      console.warn(data.msg);
      console.warn(data.error);
      return data;
    }
    const { dispatcher } = data;
    console.warn(dispatcher);
    // update redux store
    // ONLY UPDATE REDUX STORE VIA SOCKET IO
    dispatch(setArbiter(dispatcher));

    // finish async api call
    return dispatcher;
  } catch (err) {
    throw err;
  }
};

export const fetchArbiter = () => async (
  dispatch: Function,
  getState: Function,
) => {
  try {
    const { rtcId } = getState().main;

    // fetch dispatcher from signaling server
    const { data } = await post(`http://localhost:${PORT}/dispatcher`, {
      rtcId,
    });
    // handle error
    if (data.error) {
      console.warn('error updating dispatcher');
      console.warn(data.msg);
      console.warn(data.error);
      return data;
    }
    const { dispatcher } = data;

    // update redux store
    dispatch(setArbiter(dispatcher));
    // finish async api call
    return dispatcher;
  } catch (err) {
    throw err;
  }
};
