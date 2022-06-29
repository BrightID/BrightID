// exclude some keys from persisting channels

import { createTransform } from 'redux-persist';
import ChannelAPI from '@/api/channelService';

const RecoveryDataTransform = createTransform(
  (
    inboundState: {
      channelId: string;
      url: URL;
      expires: number;
      pollTimerId: IntervalId;
    },
    _key,
  ) => {
    console.log(`Persisting recovery channel: ${inboundState}`);
    return { ...inboundState };
  },
  (outboundState: any, _key) => {
    const newState = { ...outboundState };
    if (newState?.url) {
      console.log(`restoring URL object for recovery channel url`);
      newState.url = new URL(outboundState.url);
    }
    if (newState.pollTimerId) {
      console.log(
        `clearing pollTimerId of recovery channel ${newState.channelId}`,
      );
      newState.pollTimerId = null;
    }
    return newState;
  },
  {
    whitelist: ['channel'],
  },
);

const ChannelsTransform = createTransform(
  // clear timerIDs and API instance before persisting
  (inboundState: ChannelsState, _key) => {
    const newState = {};
    Object.keys(inboundState).forEach((id, _index) => {
      newState[id] = {
        ...inboundState[id],
        api: undefined,
        pollTimerId: undefined,
        timeoutId: undefined,
      };
    });
    return newState;
  },

  // recreate URL and api objects when hydrating
  (outboundState: any, _key) => {
    const newState = {};
    Object.keys(outboundState).forEach((id, _index) => {
      const url = new URL(outboundState[id].url);
      const api = new ChannelAPI(url.href);
      newState[id] = {
        ...outboundState[id],
        url,
        api,
      };
    });
    return newState;
  },

  {
    // only apply transform on the "entities" object
    whitelist: ['entities'],
  },
);

export { ChannelsTransform, RecoveryDataTransform };
