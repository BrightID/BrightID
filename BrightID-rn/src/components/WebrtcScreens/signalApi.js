// @flow

import { post } from 'axios';
import { setRtcId, setArbiter } from '../../actions';

// export const URL = 'https://signal.hotlinebling.space'; // place your url here
export const URL = 'http://localhost:3001';
export const USERA = 'USERA';
export const USERB = 'USERB';
export const ICE_CANDIDATE = 'ICE_CANDIDATE';
export const PUBLIC_KEY = 'PUBLIC_KEY';
export const OFFER = 'OFFER';
export const ANSWER = 'ANSWER';

/**
 * signaling api
 * ===================
 */

export const createRTCId = () => async (dispatch: Function) => {
  try {
    const res = await fetch(`${URL}/id`);
    const { rtcId, arbiter } = await res.json();

    // update redux store
    dispatch(setRtcId(rtcId));
    // only userA initializes creation an RTC Id
    dispatch(setArbiter(arbiter));

    // return rtcId to component letting it know api fetch is successful
    return rtcId;
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

    const { rtcId } = getState().main;
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
    // console.log(data.arbiter);
    // update redux store
    // ONLY UPDATE REDUX STORE VIA SOCKET IO
    dispatch(setArbiter(data.arbiter));

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
    const { rtcId } = getState().main;

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
    dispatch(setArbiter(arbiter));
    // finish async api call
    return arbiter;
  } catch (err) {
    console.log(err);
  }
};

export const exchangeAvatar = ({ person }) => async (
  dispatch: Function,
  getState: Function,
) => {
  try {
    // obtain rtcId from redux store - which is the source of truth
    const { rtcId, userAvatar } = getState().main;

    // fetch arbiter from signaling server
    const { data } = await post(`${URL}/avatar`, {
      rtcId,
      person,
      avatar: userAvatar,
    });

    if (data.msg === 'avatar recieved') {
      // that's good
    }
  } catch (err) {
    console.log(err);
  }
};
