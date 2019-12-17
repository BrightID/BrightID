import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import { AppsScreen } from '../Apps/AppsScreen';

// you can mock any middlewares here if necessary

const props = {
  navigation: { navigate: jest.fn() },
};

describe('Testing AppsScreen', () => {
  it('renders as expected', () => {
    const wrapper = renderer.create(<AppsScreen {...props} />);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
