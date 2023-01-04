import * as React from 'react';
import i18next from 'i18next';
import { fireEvent, screen } from '@testing-library/react-native';
import { PreloadedState } from '@reduxjs/toolkit';
import TrustlevelModal from '@/components/Connections/TrustlevelModal';
import { renderWithProviders } from '@/utils/test-utils';
import { connection_levels } from '@/utils/constants';
import clearAllMocks = jest.clearAllMocks;
import { initialConnectionsState } from '@/reducer/connectionsSlice';

const mockNavigation = {
  navigate: jest.fn(),
  dispatch: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigation.navigate,
      dispatch: mockNavigation.dispatch,
      goBack: mockNavigation.goBack,
    }),
  };
});

// mock navigation prop
const createTestProps = (props: Record<string, unknown>) => ({
  navigation: mockNavigation,
  ...props,
});

describe('TrustlevelModal', () => {
  let props: any; // use type "any" to opt-out of type-checking

  afterEach(() => {
    clearAllMocks();
  });

  it('does not render and closes itself when connection is not existing', () => {
    props = createTestProps({
      route: {
        params: {
          connectionId: '1',
        },
      },
    });
    renderWithProviders(<TrustlevelModal {...props} />);
    // should not render anything
    expect(screen.toJSON()).toBe(null);
    // should close itself by calling navigate.back()
    expect(mockNavigation.goBack).toBeCalledTimes(1);
  });

  it('does not render and closes itself when connection is undefined', () => {
    props = createTestProps({
      route: {
        params: {},
      },
    });
    renderWithProviders(<TrustlevelModal {...props} />);
    // should not render anything
    expect(screen.toJSON()).toBe(null);
    // should close itself by calling navigate.back()
    expect(mockNavigation.goBack).toBeCalledTimes(1);
  });

  it('shows name and trustlevel', () => {
    const testConnection = {
      id: 'aaa',
      name: 'Johnny Test',
      incomingLevel: connection_levels.ALREADY_KNOWN,
      level: connection_levels.ALREADY_KNOWN,
    };
    const preloadedState: PreloadedState<RootState> = {
      connections: {
        ...initialConnectionsState,
        _persist: {
          rehydrated: true,
          version: 1,
        },
        connections: {
          ids: [testConnection.id],
          entities: {
            aaa: testConnection,
          },
        },
      },
    };
    props = createTestProps({
      route: {
        params: {
          connectionId: testConnection.id,
        },
      },
    });
    renderWithProviders(<TrustlevelModal {...props} />, {
      preloadedState,
    });
    // should show connection name
    screen.getByText(testConnection.name, {
      exact: false,
    });
    // should show current trustlevel. Can't do real text match here because the translated description
    // is not available in test environment (probably to be fixed in utils/connectionLevelStrings.ts)
    screen.getByText('😎', {
      exact: false,
    });
    // should show current trustlevel description
    screen.getByText(i18next.t('connectionDetails.text.levelAlreadyKnown'), {
      exact: false,
    });
    // pressing "save" button should close dialog
    fireEvent.press(
      screen.getByText(i18next.t('connectionDetails.button.levelSave')),
    );
    expect(mockNavigation.goBack).toBeCalledTimes(1);
  });
});
