import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import Clipboard from '@react-native-community/clipboard';
import ErrorFallback from '@/components/ErrorFallback';

jest.mock('@react-native-community/clipboard');

describe('ErrorFallback', () => {
  const error = new Error(`The error`);
  const resetFn = jest.fn();

  it('shows error string', () => {
    render(<ErrorFallback error={error} resetError={resetFn} />);
    expect(screen.getByText(error.toString())).toBeTruthy();
  });

  it('copies stacktrace to clipboard', () => {
    render(<ErrorFallback error={error} resetError={resetFn} />);
    fireEvent.press(screen.getByText('Copy stacktrace', { exact: false }));
    expect(Clipboard.setString).toBeCalledTimes(1);
    expect(Clipboard.setString).toBeCalledWith(error.stack);
  });

  it('user can retry', () => {
    render(<ErrorFallback error={error} resetError={resetFn} />);
    fireEvent.press(screen.getByText('Try again', { exact: false }));
    expect(resetFn).toBeCalledTimes(1);
  });
});
