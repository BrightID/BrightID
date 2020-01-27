import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import { Onboard } from '../OnboardingScreens/Onboard';

// you can mock any middlewares here if necessary

const props = {
  navigation: { navigate: jest.fn() },
};

describe('Testing Onboard', () => {
  it('renders as expected', () => {
    const wrapper = renderer.create(<Onboard {...props} />);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
