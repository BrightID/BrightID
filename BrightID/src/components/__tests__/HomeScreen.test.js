import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import { HomeScreen } from '../HomeScreen';

// you can mock any middlewares here if necessary

const props = {
  navigation: { navigate: jest.fn() },
  name: 'Test',
  score: 100,
  groupsCount: 2,
  photo: { filename: '' },
  connections: [],
  verifications: [],
};

describe('Testing HomeScreen', () => {
  it('renders as expected', () => {
    const wrapper = renderer.create(<HomeScreen {...props} />);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
