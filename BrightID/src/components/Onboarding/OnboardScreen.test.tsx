import * as React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import Onboard from './OnboardScreen';
import { renderWithProviders } from '@/utils/test-utils';
import { qrCodeURL_types } from '@/utils/constants';
import clearAllMocks = jest.clearAllMocks;

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockedNavigate }),
}));

describe('OnboardScreen', () => {
  afterEach(() => {
    clearAllMocks();
  });

  it(`has create, recover and import button`, () => {
    renderWithProviders(<Onboard />);
    expect(screen.getByTestId('createBrightID')).toBeVisible();
    expect(screen.getByTestId('recoverBrightID')).toBeVisible();
    expect(screen.getByTestId('importBrightID')).toBeVisible();
  });

  it(`starts to create a BrightID`, async () => {
    renderWithProviders(<Onboard />);
    fireEvent.press(screen.getByTestId('createBrightID'));
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith('SignupName'),
    );
  });

  it(`starts to recover a BrightID`, async () => {
    renderWithProviders(<Onboard />);
    fireEvent.press(screen.getByTestId('recoverBrightID'));
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith('Restore', {
        params: { action: 'recovery', urlType: qrCodeURL_types.RECOVERY },
        screen: 'RecoveryCode',
      }),
    );
  });

  it(`starts to import a BrightID`, async () => {
    renderWithProviders(<Onboard />);
    fireEvent.press(screen.getByTestId('importBrightID'));
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith('Import', {
        params: { action: 'import', urlType: qrCodeURL_types.IMPORT },
        screen: 'ImportCode',
      }),
    );
  });
});
