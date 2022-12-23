import * as React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@/utils/test-utils';
import Eula from '@/components/Onboarding/Eula';

describe('Eula', () => {
  it(`has accept, reject button`, () => {
    renderWithProviders(<Eula />);
    expect(screen.getByTestId('rejectEulaBtn')).toBeVisible();
    expect(screen.getByTestId('acceptEulaBtn')).toBeVisible();
  });

  it(`can be accepted`, () => {
    const { store } = renderWithProviders(<Eula />);
    expect(store.getState().user.eula).toBeFalsy();
    fireEvent.press(screen.getByTestId('acceptEulaBtn'));
    expect(store.getState().user.eula).toBeTruthy();
  });
});
