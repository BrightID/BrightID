import 'react-native';
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import { ConnectionsScreen } from '../Connections/ConnectionsScreen';

// you can mock any middlewares here if necessary

const props = {
  dispatch: jest.fn(),
  navigation: { navigate: jest.fn() },
  searchParam: '',
  connections: [],
};

const renderer = new ShallowRenderer();

describe('Testing ConnectionsScreen', () => {
  it('renders blank connection screen', () => {
    renderer.render(<ConnectionsScreen {...props} />);
    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });
});
