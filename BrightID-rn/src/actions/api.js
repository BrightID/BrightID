// @flow

import { post } from 'axios';

import { setRtcId, setArbiter } from './index';

export const PORT = '3001';

export const ALPHA = 'ALPHA';
export const ZETA = 'ZETA';
export const ICE_CANDIDATE = 'ICE_CANDIDATE';
export const OFFER = 'OFFER';
export const ANSWER = 'ANSWER';

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

export const fetchEntries = () => async () => {
  try {
    const res = await fetch(`http://localhost:${PORT}/entries`);
    const { entries } = await res.json();
    console.log(entries);
  } catch (err) {
    throw err;
  }
};
