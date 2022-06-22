// exclude some keys from persisting channels

import { createTransform } from 'redux-persist';

const ChannelsTransform = createTransform(
  // clear timerIDs and API instance before persisting
  (inboundState: ChannelsState, _key) => {
    const newState = {};
    Object.keys(inboundState).forEach((id, index) => {
      console.log(`inbound channel #${index}, id ${id}`);
      newState[id] = {
        ...inboundState[id],
        api: undefined,
        pollTimerId: undefined,
        timeoutId: undefined,
      };
    });
    console.log(Object.values(newState));
    return newState;
  },

  // recreate URL object from url string when restoring
  (outboundState: any, _key) => {
    const newState = {};
    Object.keys(outboundState).forEach((id, index) => {
      console.log(`outbound channel #${index}, id ${id}`);
      console.log(outboundState[id]);
      newState[id] = {
        ...outboundState[id],
        url: new URL(outboundState[id].url),
      };
    });
    console.log(Object.values(newState));
    return newState;
  },

  {
    // only apply transform on the "entities" object
    whitelist: ['entities'],
  },
);

export default ChannelsTransform;
