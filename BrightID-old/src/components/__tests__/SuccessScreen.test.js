import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import { SuccessScreen } from '../NewConnectionsScreens/SuccessScreen';

// you can mock any middlewares here if necessary

const props = {
  navigation: { navigate: jest.fn() },
  dispatch: jest.fn(),
};

describe('Testing SuccessScreen', () => {
  it('renders as expected', () => {
    const wrapper = renderer.create(<SuccessScreen {...props} />);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
