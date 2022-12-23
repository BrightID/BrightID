import * as React from 'react';
// Import Jest Native matchers
import '@testing-library/jest-native/extend-expect';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@/utils/test-utils';
import NameScreen from '@/components/Onboarding/SignUpFlow/NameScreen';

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockedNavigate }),
}));

describe('NameScreen', () => {
  it(`submit button is disabled when no name is entered`, () => {
    const name = 'John';
    renderWithProviders(<NameScreen />);
    const inputField = screen.getByTestId('editName');
    const submitBtn = screen.getByTestId('submitName');
    expect(submitBtn).toBeDisabled();
    fireEvent.changeText(inputField, name);
    expect(submitBtn).toBeEnabled();
  });
});
