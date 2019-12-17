import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import { ScanCodeScreen } from '../NewConnectionsScreens/ScanCodeScreen';

// you can mock any middlewares here if necessary

const props = {
  navigation: { navigate: jest.fn() },
  dispatch: jest.fn(),
};

describe('Testing ScanCodeScreen', () => {
  it('renders as expected', () => {
    const wrapper = renderer.create(<ScanCodeScreen {...props} />);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
