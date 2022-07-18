// exclude some keys from persisting channels

import { createTransform } from 'redux-persist';
import { Dictionary } from '@reduxjs/toolkit';
import ChannelAPI from '@/api/channelService';

const RecoveryDataTransform = createTransform(
  // clear pollTimerId before persisting
  (inboundState: RecoveryChannel, _key): RecoveryChannel => {
    return {
      ...inboundState,
      pollTimerId: undefined,
      // url: URL object gets implicitly converted to string when serializing
    };
  },

  // restore URL object when hydrating
  (outboundState: any, _key): RecoveryChannel => {
    return {
      ...outboundState,
      url: outboundState.url ? new URL(outboundState.url) : undefined,
    };
  },

  {
    // only apply transform on the "channel" key of RecoveryData
    whitelist: ['channel'],
  },
);

const ChannelsTransform = createTransform(
  // clear timerIDs and API instance before persisting
  (inboundState: Dictionary<Channel>, _key) => {
    const newState: Dictionary<Channel> = {};
    Object.keys(inboundState).forEach((id, _index) => {
      newState[id] = {
        ...inboundState[id],
        api: undefined,
        pollTimerId: undefined,
        timeoutId: undefined,
        // url: URL object gets implicitly converted to string when serializing
      };
    });
    return newState;
  },

  // restore URL and api objects when hydrating
  (outboundState: Dictionary<any>, _key) => {
    const newState: Dictionary<Channel> = {};
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
    // only apply transform on the "entities" key of ChannelSlice
    whitelist: ['entities'],
  },
);

export { ChannelsTransform, RecoveryDataTransform };
