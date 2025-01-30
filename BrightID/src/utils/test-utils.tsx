import React, { PropsWithChildren } from 'react';
import type { PreloadedState } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render, RenderOptions } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { setupStore } from '@/store';
import i18n from '../i18nForTests';
import {
  ApiGateState,
  getGlobalNodeApi,
  NodeApiContext,
} from '@/context/NodeApiContext';
import { NodeApi } from '@/api/brightId';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
  api?: NodeApi;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = undefined,
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    api = getGlobalNodeApi(),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <NodeApiContext.Provider
            value={{
              api,
              url: 'http://127.0.0.1',
              gateState: ApiGateState.INITIAL,
              retryHandler: jest.fn(),
              startTimestamp: 0,
            }}
          >
            {children}
          </NodeApiContext.Provider>
        </I18nextProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
