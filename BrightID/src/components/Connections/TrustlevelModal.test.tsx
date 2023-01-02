import * as React from 'react';
import i18next from 'i18next';
import { fireEvent, screen } from '@testing-library/react-native';
import TrustlevelModal from '@/components/Connections/TrustlevelModal';
import { renderWithProviders } from '@/utils/test-utils';
import { connection_levels } from '@/utils/constants';
import clearAllMocks = jest.clearAllMocks;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};
// mock navigation prop
const createTestProps = (props: Record<string, unknown>) => ({
  navigation: mockNavigation,
  ...props,
});
// mock useNavigation hook for components that rely on useNavigation() instead of the `navigation` prop provided
// by react navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

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
    props = createTestProps({
      route: {
        params: {
          connectionId: 'aaa',
        },
      },
    });
    renderWithProviders(<TrustlevelModal {...props} />, {
      preloadedState: {
        connections: {
          connections: {
            ids: ['aaa'],
            entities: {
              aaa: {
                id: 'aaa',
                name: 'name',
                incomingLevel: connection_levels.ALREADY_KNOWN,
                level: connection_levels.ALREADY_KNOWN,
              },
            },
          },
        },
      },
    });
    // should show connection name
    screen.getByText('name', {
      exact: false,
    });
    // should show current trustlevel. Can't do real text match here because the translated description
    // is not available in test environment (see utils/connectionLevelStrings.ts)
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
