// @flow

import { post } from 'axios';

import {
  setRtcId,
  setUserADispatcher,
  setUserBDispatcher,
  userAWaiting,
  userBWaiting,
} from './index';

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
    dispatch(setUserADispatcher(dispatcher));

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
    if (person === ALPHA) {
      rtcId = getState().userA.rtcId;
    } else if (person === ZETA) {
      rtcId = getState().userB.rtcId;
    }
    console.log(rtcId);
    // attempt to fetch dispatcher
    const { data } = await post(`http://localhost:${PORT}/update`, {
      rtcId,
      person,
      type,
      value,
    });
    // handle error
    if (data.error) {
      console.log('error updating dispatcher');
      console.log(data.msg);
      console.log(data.error);
      return data;
    }
    const { dispatcher } = data;
    // update redux store
    if (person === ALPHA) {
      dispatch(setUserADispatcher(dispatcher));
    } else if (person === ZETA) {
      dispatch(setUserBDispatcher(dispatcher));
    }
    // finish async api call
    return dispatcher;
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
    let waiting = null;
    // check waiting status
    if (person === ALPHA) {
      waiting = getState().userA.waiting;
    } else if (person === ZETA) {
      waiting = getState().userB.waiting;
    }
    // do not send a network request if one is already in progress
    // if (waiting) {
    //   console.log('waiting');
    //   return null;
    // }
    console.log('fetching dispatcher');
    // update redux store with network status
    if (person === ALPHA) {
      rtcId = getState().userA.rctId;
      dispatch(userAWaiting());
    } else if (person === ZETA) {
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
    const { dispatcher } = data;
    console.log(data);
    console.log(dispatcher);
    // update redux store
    if (person === ALPHA) {
      dispatch(setUserADispatcher(dispatcher));
    } else if (person === ZETA) {
      dispatch(setUserBDispatcher(dispatcher));
    }
    // finish async api call
    return dispatcher;
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
