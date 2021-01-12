// @flow

import configureStore from 'redux-mock-store';
import { getDefaultMiddleware } from '@reduxjs/toolkit';
import ChannelAPI from '@/api/channelService';
import { setupRecovery } from './recoveryThunks';
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
  // const ipAddress = '192.168.2.2';

  test(`setup recovery data`, async () => {
    const store = mockStore({ recoveryData: initialState });

    const expectedInitAction = expect.objectContaining({
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

    const initAction = actions[0];

    expect(initAction).toEqual(expectedInitAction);
  });
});
