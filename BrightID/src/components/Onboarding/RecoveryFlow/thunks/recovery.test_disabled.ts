import nacl from 'tweetnacl';
import configureStore from 'redux-mock-store';
import { getDefaultMiddleware } from '@reduxjs/toolkit';
import ChannelAPI from '@/api/channelService';
import { hash, uInt8ArrayToB64, b64ToUrlSafeB64 } from '@/utils/encoding';
import { setupRecovery } from './recoveryThunks';
import { createChannel, checkChannel } from './channelThunks';
import { uploadSig, uploadConnection } from './channelUploadThunks';
import { initialState } from '../recoveryDataSlice';

const FIFTEEN_MINUTES = 900000;

const recoveryId = '8a-tLVW6tetqYen880vHTUYgBfySWRPEPnaf7jyxWmc';

const mockStore = configureStore(
  getDefaultMiddleware({
    // We have a bunch of non-serializable data like secret key etc.
    // TODO For now disabled completely. Revisit later for fine-grained configuration.
    serializableCheck: false,
    immutableCheck: true,
  }),
);

// we use `recoveryData` throughout these tests instead of relying on redux
const recoveryData = initialState;
const settings = {
  baseUrl: new URL('http://test.brightid.org'),
};

describe('Test recovery data', () => {
  test(`setup recovery data`, async () => {
    const store = mockStore({ recoveryData, settings });

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

    // update recoveryData for future tests
    Object.assign(recoveryData, {
      publicKey: action.payload.publicKey,
      secretKey: action.payload.secretKey,
      aesKey: action.payload.aesKey,
      timestamp: Date.now(),
    });
  });

  test('create channel', async () => {
    // update timeout for this test
    jest.setTimeout(10000);
    const store = mockStore({ recoveryData, settings });

    const expectedAction = expect.objectContaining({
      type: 'recoveryData/setRecoveryChannel',
      payload: {
        channelId: expect.any(String),
        url: expect.any(URL),
      },
    });

    await store.dispatch(createChannel());

    const actions = store.getActions();
    expect(actions).toHaveLength(1);

    const action = actions[0];

    expect(action).toEqual(expectedAction);

    // update recoveryData for future tests
    Object.assign(recoveryData.channel, {
      channelId: action.payload.channelId,
      url: action.payload.url,
      expires: Date.now() + FIFTEEN_MINUTES,
    });
  });

  test('upload name / photo', async () => {
    try {
      // update timeout for this test
      jest.setTimeout(10000);
      const { aesKey } = recoveryData;
      const channelApi = new ChannelAPI(recoveryData.channel.url.href);

      const conn = {
        id: recoveryId,
        name: 'Donaugh Bownd',
        photo: {},
        testPhoto,
      };

      // TODO Fix conn type
      // await uploadConnection({ aesKey, channelApi, conn });

      const dataIds = await channelApi.list(hash(aesKey));

      expect(dataIds).toEqual(['data', `connection_${recoveryId}`]);
    } catch (err) {
      console.error(err.message);
      expect(false).toEqual(true);
    }
  });

  test('upload sigs', async () => {
    try {
      // update timeout for this test
      jest.setTimeout(10000);
      const { aesKey } = recoveryData;
      const channelApi = new ChannelAPI(recoveryData.channel.url.href);

      const { publicKey, secretKey } = await nacl.sign.keyPair();
      const b64PubKey = uInt8ArrayToB64(publicKey);
      const id = b64ToUrlSafeB64(b64PubKey);

      const store = mockStore({
        keypair: { secretKey },
        user: { id },
      });

      const sigData = {
        id: recoveryId,
        aesKey,
        channelApi,
      };

      await store.dispatch(uploadSig(sigData));

      const { publicKey: pb2, secretKey: sk2 } = await nacl.sign.keyPair();
      const b64PubKey2 = uInt8ArrayToB64(pb2);
      const id2 = b64ToUrlSafeB64(b64PubKey2);

      const store2 = mockStore({
        keypair: { secretKey: sk2 },
        user: { id: id2 },
      });

      await store2.dispatch(uploadSig(sigData));

      const dataIds = await channelApi.list(hash(aesKey));

      expect(dataIds).toHaveLength(4);
    } catch (err) {
      console.error(err.message);
      expect(false).toEqual(true);
    }
  });
  test('download name / photo / sigs', async () => {
    // update timeout for this test
    jest.setTimeout(15000);

    // update recoveryId to download name / photo
    recoveryData.id = recoveryId;

    const store = mockStore({
      connections: { connections: [] },
      groups: { groups: [] },
      recoveryData,
    });

    const expectedNamePhotoAction = expect.objectContaining({
      type: 'recoveryData/updateNamePhoto',
      payload: {
        id: recoveryId,
        name: 'Donaugh Bownd',
        photo: { filename: `${recoveryId}.jpg` },
        profileTimestamp: expect.any(Number),
        aesKey: expect.any(String),
      },
    });

    const expectedSetSigAction = expect.objectContaining({
      type: 'recoveryData/setSig',
      payload: {
        signer: expect.any(String),
        sig: {
          signer: expect.any(String),
          sig: expect.any(String),
          id: recoveryId,
        },
      },
    });

    await store.dispatch(checkChannel());

    const actions = store.getActions();

    expect(actions[0]).toEqual(expectedNamePhotoAction);
    expect(actions[1]).toEqual(expectedSetSigAction);
    expect(actions[2]).toEqual(expectedSetSigAction);
  });
});

const testPhoto =
  'data:image/jpeg;base64,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';
