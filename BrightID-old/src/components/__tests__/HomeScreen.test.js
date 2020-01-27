import 'react-native';
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import { HomeScreen } from '../HomeScreen';
import BottomNav from '../BottomNav';

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

const renderer = new ShallowRenderer();

describe('Testing HomeScreen', () => {
  it('renders as expected', () => {
    renderer.render(<HomeScreen {...props} />);
    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });
});
