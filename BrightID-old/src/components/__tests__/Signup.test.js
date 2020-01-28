import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import { SignUp } from '../OnboardingScreens/SignUp';

// you can mock any middlewares here if necessary

const props = {
  navigation: { navigate: jest.fn() },
  dispatch: jest.fn(),
};

describe('Testing SignUp', () => {
  it('renders as expected', () => {
    const wrapper = renderer.create(<SignUp {...props} />);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
