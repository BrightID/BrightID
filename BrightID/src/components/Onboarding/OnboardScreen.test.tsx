import * as React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import Onboard from './OnboardScreen';
import { renderWithProviders } from '@/utils/test-utils';
import { qrCodeURL_types } from '@/utils/constants';
import clearAllMocks = jest.clearAllMocks;

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
    const { navigate } = useNavigation();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('SignupName'));
  });

  it(`starts to recover a BrightID`, async () => {
    renderWithProviders(<Onboard />);
    fireEvent.press(screen.getByTestId('recoverBrightID'));
    const { navigate } = useNavigation();
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('RecoveryCode', {
        action: 'recovery',
        urlType: qrCodeURL_types.RECOVERY,
      }),
    );
  });

  it(`starts to import a BrightID`, async () => {
    renderWithProviders(<Onboard />);
    fireEvent.press(screen.getByTestId('importBrightID'));
    const { navigate } = useNavigation();
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('ImportCode', {
        action: 'import',
        urlType: qrCodeURL_types.IMPORT,
      }),
    );
  });
});
