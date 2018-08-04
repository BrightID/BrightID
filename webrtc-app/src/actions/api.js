import { post } from 'axios';

import { setRtcId, setDispatcher } from './index';

export const PORT = '3001';

export const ALPHA = 'ALPHA';
export const ZETA = 'ZETA';
export const ICE_CANDIDATE = 'ICE_CANDIDATE';
export const OFFER = 'OFFER';
export const ANSWER = 'ANSWER';

export const createRTCId = () => async (
  dispatch: Function,
  getState: Function,
) => {
  try {
    const res = await fetch(`http://localhost:${PORT}/id`);
    const { rtcId, dispatcher } = await res.json();

    // simulate network delay
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });

    // update redux store
    dispatch(setRtcId(rtcId));
    dispatch(setDispatcher(dispatcher));

    // return rtcId to component letting it know api fetch is successful
    return rtcId;
  } catch (err) {
    throw err;
  }
};

export const update = ({ type, person, value }) => async (
  dispatch: Function,
  getState: Function,
) => {
  try {
    const { rtcId } = getState();
    const {
      data: { msg, dispatcher },
    } = await post(`http://localhost:${PORT}/update`, {
      rtcId,
      person,
      type,
      value,
    });
    dispatch(setDispatcher(dispatcher));
    console.log({ msg, dispatcher });
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
