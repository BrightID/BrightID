// @flow
import {
  setConnectPublicKey,
  setConnectTimestamp,
  setConnectNameornym,
} from './index';

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

  console.tron.log(msg);
};

export const hello = 'hello';
