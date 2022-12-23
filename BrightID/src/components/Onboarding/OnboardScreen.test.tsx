import * as React from 'react';
import { screen } from '@testing-library/react-native';
import Onboard from './OnboardScreen';
import { renderWithProviders } from '@/utils/test-utils';

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockedNavigate }),
}));

describe('OnboardScreen', () => {
  it(`has create, recover and import button`, () => {
    renderWithProviders(<Onboard />);
    expect(screen.getByTestId('createBrightID')).toBeVisible();
    expect(screen.getByTestId('recoverBrightID')).toBeVisible();
    expect(screen.getByTestId('importBrightID')).toBeVisible();
  });
});
