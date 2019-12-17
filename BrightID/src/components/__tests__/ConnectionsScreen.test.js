import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import { ConnectionsScreen } from '../Connections/ConnectionsScreen';

// you can mock any middlewares here if necessary

const props = {
  dispatch: jest.fn(),
  navigation: { navigate: jest.fn() },
  searchParam: '',
  connections: [],
};

describe('Testing ConnectionsScreen', () => {
  it('renders blank connection screen', () => {
    const wrapper = renderer.create(<ConnectionsScreen {...props} />);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
