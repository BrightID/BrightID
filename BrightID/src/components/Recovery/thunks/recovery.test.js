// @flow

import configureStore from 'redux-mock-store';
import { getDefaultMiddleware } from '@reduxjs/toolkit';
import ChannelAPI from '@/api/channelService';
import { hash } from '@/utils/encoding';
import { setupRecovery } from './recoveryThunks';
import { createChannel } from './channelThunks';
import { initialState } from '../recoveryDataSlice';

const mockStore = configureStore(
  getDefaultMiddleware({
    // We have a bunch of non-serializable data like secret key etc.
    // TODO For now disabled completely. Revisit later for fine-grained configuration.
    serializableCheck: false,
    immutableCheck: true,
  }),
);

describe('Test recovery data', () => {
  test(`setup recovery data`, async () => {
    const store = mockStore({ recoveryData: initialState });

    const expectedAction = expect.objectContaining({
      type: 'recoveryData/init',
      payload: {
        publicKey: expect.any(Uint8Array),
        secretKey: expect.any(Uint8Array),
        aesKey: expect.any(String),
      },
    });

    await store.dispatch(setupRecovery());

    // assertions
    const actions = store.getActions();
    expect(actions).toHaveLength(1);

    const action = actions[0];

    expect(action).toEqual(expectedAction);
  });

  test('create channel', async () => {
    const recoveryData = {
      publicKey: new Uint8Array(),
      timestamp: Date.now(),
      aesKey: '9/n9l2vcdW7vaga2SgDByw==',
    };

    const expectedAction = expect.objectContaining({
      type: 'recoveryData/setChannel',
      payload: {
        channelId: expect.any(String),
        url: expect.stringContaining('http://'),
      },
    });

    const store = mockStore({ recoveryData });
    await store.dispatch(createChannel());

    const actions = store.getActions();
    expect(actions).toHaveLength(1);

    const action = actions[0];

    expect(action).toEqual(expectedAction);
  });
});
