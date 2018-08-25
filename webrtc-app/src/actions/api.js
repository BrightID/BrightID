// @flow

import { post } from 'axios';

import {
  setRtcId,
  setUserAArbiter,
  setUserBArbiter,
  userAWaiting,
  userBWaiting,
} from './index';

export const PORT = '3001';

export const USERA = 'USERA';
export const USERB = 'USERB';
export const ICE_CANDIDATE = 'ICE_CANDIDATE';
export const OFFER = 'OFFER';
export const ANSWER = 'ANSWER';

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
    dispatch(setUserAArbiter(arbiter));

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
    let rtcId = null;
    if (person === USERA) {
      rtcId = getState().userA.rtcId;
    } else if (person === USERB) {
      rtcId = getState().userB.rtcId;
    }
    console.log(rtcId);
    // attempt to fetch dispatcher
    // in future encrypt data
    let box = value;
    const { data } = await post(`http://localhost:${PORT}/update`, {
      rtcId,
      person,
      type,
      box,
    });
    // handle error
    if (data.error) {
      console.log('error updating dispatcher');
      console.log(data.msg);
      console.log(data.error);
      return data;
    }
    const { arbiter } = data;
    console.log(arbiter);
    // update redux store
    // ONLY UPDATE REDUX STORE VIA SOCKET IO
    if (person === USERA) {
      dispatch(setUserAArbiter(arbiter));
    } else if (person === USERB) {
      dispatch(setUserBArbiter(arbiter));
    }
    // finish async api call
    return arbiter;
  } catch (err) {
    throw err;
  }
};

export const fetchDispatcher = (person) => async (
  dispatch: Function,
  getState: Function,
) => {
  try {
    let rtcId = null;
    // let waiting = null;
    // // check waiting status
    // if (person === USERA) {
    //   waiting = getState().userA.waiting;
    // } else if (person === USERB) {
    //   waiting = getState().userB.waiting;
    // }
    // do not send a network request if one is already in progress
    // if (waiting) {
    //   console.log('waiting');
    //   return null;
    // }

    // update redux store with network status
    if (person === USERA) {
      rtcId = getState().userA.rctId;
      dispatch(userAWaiting());
    } else if (person === USERB) {
      rtcId = getState().userB.rtcId;
      dispatch(userBWaiting());
    }
    // fetch dispatcher from signaling server
    const { data } = await post(`http://localhost:${PORT}/dispatcher`, {
      rtcId,
    });
    // handle error
    if (data.error) {
      console.log('error updating dispatcher');
      console.log(data.msg);
      console.log(data.error);
      return data;
    }
    const { arbiter } = data;
    console.log(data);
    console.log(arbiter);
    // update redux store
    if (person === USERA) {
      dispatch(setUserAArbiter(arbiter));
    } else if (person === USERB) {
      dispatch(setUserBArbiter(arbiter));
    }
    // finish async api call
    return arbiter;
  } catch (err) {
    throw err;
  }
};

export const fetchEntries = () => async (
  dispatch: Function,
  getState: Function,
) => {
  try {
    const res = await fetch(`http://localhost:${PORT}/entries`);
    const { entries } = await res.json();
    console.log(entries);
  } catch (err) {
    throw err;
  }
};
