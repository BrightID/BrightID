import 'react-native';
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import { AppsScreen } from '../Apps/AppsScreen';

// you can mock any middlewares here if necessary

const props = {
  navigation: { navigate: jest.fn() },
};

const renderer = new ShallowRenderer();

describe('Testing AppsScreen', () => {
  it('renders as expected', () => {
    renderer.render(<AppsScreen {...props} />);
    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });
});
