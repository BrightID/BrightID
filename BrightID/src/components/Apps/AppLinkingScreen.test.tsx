import * as React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import nacl from 'tweetnacl';
import i18next from 'i18next';
import { renderWithProviders } from '@/utils/test-utils';
import AppLinkingScreen from '@/components/Apps/AppLinkingScreen';
import {
  selectApplinkingStep,
  selectSponsorOperationHash,
  setAppLinkingStep,
  setApps,
  setLinkingAppInfo,
} from '@/reducer/appsSlice';
import { app_linking_steps, operation_states } from '@/utils/constants';
import { setupStore } from '@/store';
import {
  selectPendingOperations,
  updateOperation,
} from '@/reducer/operationsSlice';
import { setUserId, setVerifications } from '@/reducer/userSlice';
import { b64ToUrlSafeB64, uInt8ArrayToB64 } from '@/utils/encoding';
import { setKeypair } from '@/reducer/keypairSlice';
import { handleLinkContextOpUpdate } from '@/components/Apps/appThunks';
import clearAllMocks = jest.clearAllMocks;
import { verificationFriendlyName } from '@/utils/verifications';

// Use msw to intercept network requests
const basePath = 'https://not.valid/brightId';
export const handlers = [
  rest.get(`${basePath}/v6/sponsorships/:appUserId`, (req, res, ctx) => {
    // console.log(`Mocking sponsorship response for ${req.params.appUserId}`);
    return res(
      ctx.json({
        data: {
          app: 'testApp',
          appHasAuthorized: false,
          spendRequested: false,
          timestamp: 0,
        },
      }),
    );
  }),
  rest.post(`${basePath}/v6/operations`, async (req, res, ctx) => {
    // console.log(`Mocking post operation response`);
    return res(
      ctx.json({
        data: {
          hash: 'abc123',
        },
      }),
    );
  }),
  rest.post(`${basePath}/v5/operations`, async (req, res, ctx) => {
    // console.log(`Mocking v5 post operation response`);
    return res(
      ctx.json({
        data: {
          hash: 'abc123',
        },
      }),
    );
  }),
];
const server = setupServer(...handlers);

describe('AppLinkingScreen', () => {
  const sponsoringV5App = {
    id: 'sponsoringV5App',
    name: 'sponsoringV5App',
    context: 'testContext',
    verifications: ['BrightID'],
    logo: 'data:image/png;base64,abc123456',
    url: 'https://brightid.org',
    assignedSponsorships: 33167,
    unusedSponsorships: 4451,
    testing: false,
    idsAsHex: false,
    usingBlindSig: false,
    verificationExpirationLength: 0,
    sponsorPublicKey: 'D2BfstFLgILdH8Q3taY0Jl8yVuWejVR9cJSgm8OwQwo=',
    nodeUrl: '',
    soulbound: false,
    callbackUrl: '',
    sponsoring: true,
    verificationUrl: '',
  };
  const notSponsoringV5App = {
    ...sponsoringV5App,
    id: 'notSponsoringV5App',
    name: 'notSponsoringV5App',
    sponsoring: false,
  };
  const sponsoringV6App = {
    ...sponsoringV5App,
    id: 'sponsoringV6App',
    name: 'sponsoringV6App',
    usingBlindsig: true,
  };
  const notSponsoringV6App = {
    ...sponsoringV6App,
    id: 'notSponsoringV6App',
    name: 'notSponsoringV6App',
    sponsoring: false,
  };
  const keypair: Keypair = {
    publicKey: undefined,
    secretKey: undefined,
  };
  const brightIDVerification: HashVerification = {
    name: 'BrightID',
    block: 1,
    timestamp: 1,
    hash: 'abc',
  };
  let store: AppStore;

  beforeAll(async () => {
    const keys = await nacl.sign.keyPair();
    keypair.publicKey = uInt8ArrayToB64(keys.publicKey);
    keypair.secretKey = keys.secretKey;
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    // create store
    store = setupStore();
    // add data relevant for testing to store
    act(() => {
      // have apps available to link
      store.dispatch(setApps([sponsoringV5App, notSponsoringV5App]));
      // have a valid user with BrightID verification
      store.dispatch(setKeypair(keypair));
      store.dispatch(setUserId(b64ToUrlSafeB64(keypair.publicKey)));
      store.dispatch(setVerifications([brightIDVerification]));
    });
  });

  afterEach(() => {
    clearAllMocks();
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('user can cancel app linking', () => {
    // test against sponsoring v5 app
    const linkingAppInfo: LinkingAppInfo = {
      appId: sponsoringV5App.id,
      appUserId: '123',
      v: 5,
      baseUrl: 'https://not.valid',
    };
    act(() => {
      store.dispatch(setLinkingAppInfo(linkingAppInfo));
      store.dispatch(
        setAppLinkingStep({
          step: app_linking_steps.WAITING_USER_CONFIRMATION,
        }),
      );
    });

    renderWithProviders(<AppLinkingScreen />, {
      store,
    });
    fireEvent.press(screen.getByTestId('RejectLinking'));
    const step = selectApplinkingStep(store.getState());
    expect(step).toBe(app_linking_steps.IDLE);
  });

  it('rejects linking when verifications are missing', async () => {
    // test against sponsoring v5 app
    const linkingAppInfo: LinkingAppInfo = {
      appId: sponsoringV5App.id,
      appUserId: '123',
      v: 5,
      baseUrl: 'https://not.valid',
    };
    act(() => {
      store.dispatch(setLinkingAppInfo(linkingAppInfo));
      store.dispatch(
        setAppLinkingStep({
          step: app_linking_steps.WAITING_USER_CONFIRMATION,
        }),
      );
      // user has no verifications
      store.dispatch(setVerifications([]));
    });

    renderWithProviders(<AppLinkingScreen />, {
      store,
    });
    // confirm linking
    fireEvent.press(screen.getByTestId('ConfirmLinking'));
    // should inform user that a verification is missing
    await screen.findByText(
      i18next.t('apps.alert.text.missingVerification', {
        verifications: `"${verificationFriendlyName(
          sponsoringV5App.verifications[0],
        )}"`,
      }),
      {
        exact: false,
      },
    );
    // click dismiss button
    fireEvent.press(screen.getByText(i18next.t('common.alert.dismiss')));
  });

  test.todo(
    'will not allow to link user when a previous sig was created with different userID',
  );

  it('will not allow unsponsored user to link with not-sponsoring app', async () => {
    // test against not-sponsoring v5 app
    const linkingAppInfo: LinkingAppInfo = {
      appId: notSponsoringV5App.id,
      appUserId: '123',
      v: 5,
      baseUrl: 'https://not.valid',
    };
    act(() => {
      store.dispatch(setLinkingAppInfo(linkingAppInfo));
      store.dispatch(
        setAppLinkingStep({
          step: app_linking_steps.WAITING_USER_CONFIRMATION,
        }),
      );
    });

    renderWithProviders(<AppLinkingScreen />, {
      store,
    });
    // confirm linking
    fireEvent.press(screen.getByTestId('ConfirmLinking'));
    // should inform user that this app is not sponsoring
    await screen.findByText(
      i18next.t('alert.text.appNotSponsoring', {
        app: `${notSponsoringV5App.name}`,
      }),
      {
        exact: false,
      },
    );
    // click dismiss button
    fireEvent.press(screen.getByText(i18next.t('common.alert.dismiss')));
  });

  it('will sponsor and link unsponsored user', async () => {
    // test against sponsoring v5 app
    const linkingAppInfo: LinkingAppInfo = {
      appId: sponsoringV5App.id,
      appUserId: '123',
      v: 5,
      baseUrl: 'https://not.valid',
    };
    act(() => {
      store.dispatch(setLinkingAppInfo(linkingAppInfo));
      store.dispatch(
        setAppLinkingStep({
          step: app_linking_steps.WAITING_USER_CONFIRMATION,
        }),
      );
    });
    renderWithProviders(<AppLinkingScreen />, {
      store,
    });
    // should show app name
    screen.getByText(sponsoringV5App.name, {
      exact: false,
    });
    // confirm linking
    fireEvent.press(screen.getByTestId('ConfirmLinking'));

    // should wait for sponsoring op to confirm
    await waitFor(() => {
      screen.getByText(i18next.t('apps.linking.sponsorWaitingOp'));
    });

    // manually set operation to applied
    const sponsorOpHash = selectSponsorOperationHash(store.getState());
    act(() => {
      store.dispatch(
        updateOperation({
          id: sponsorOpHash,
          changes: { state: operation_states.APPLIED },
        }),
      );
    });

    // should wait for app to sponsor me
    await screen.findByText(
      i18next.t('apps.linking.sponsorWaitingApp', {
        app: sponsoringV5App.name,
      }),
      {},
      { timeout: 30000 },
    );

    // change server response to have sponsorship accepted
    server.use(
      rest.get(`${basePath}/v6/sponsorships/:appUserId`, (req, res, ctx) => {
        // console.log(`Mocking sponsorship response for ${req.params.appUserId}`);
        return res(
          ctx.json({
            data: {
              app: 'testApp',
              appHasAuthorized: true,
              spendRequested: true,
              timestamp: Date.now(),
            },
          }),
        );
      }),
    );

    // should wait for link operation to apply
    await screen.findByText(
      i18next.t('apps.linking.linkWaitingV5'),
      {},
      { timeout: 30000 },
    );

    // manually mark link Context operation as applied
    // Flaky: There should only be one pending operation existing, so it
    // must be the linkContext Op...
    const linkContextOp = selectPendingOperations(store.getState())[0];
    await act(async () => {
      store.dispatch(
        updateOperation({
          id: linkContextOp.hash,
          changes: { state: operation_states.APPLIED },
        }),
      );
      await store.dispatch(
        handleLinkContextOpUpdate({
          op: linkContextOp,
          state: operation_states.APPLIED,
          result: undefined,
        }),
      );
    });

    await screen.findByText(
      i18next.t('apps.linking.success'),
      {},
      { timeout: 30000 },
    );
  });

  test.todo('will relink already linked v5 app without error');

  test.todo('will relink already linked v6 app without error');
});
