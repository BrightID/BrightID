// @flow

import { post } from 'axios';

import { setRtcId, setArbiter } from './index';

export const PORT = '3001';

export const ALPHA = 'ALPHA';
export const ZETA = 'ZETA';
export const ICE_CANDIDATE = 'ICE_CANDIDATE';
export const OFFER = 'OFFER';
export const ANSWER = 'ANSWER';

export const fetchEntries = () => async () => {
  try {
    const res = await fetch(`http://localhost:${PORT}/entries`);
    const { entries } = await res.json();
    console.log(entries);
  } catch (err) {
    throw err;
  }
};
