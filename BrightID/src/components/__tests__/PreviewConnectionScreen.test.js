import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import { PreviewConnectionScreen } from '../NewConnectionsScreens/PreviewConnectionScreen';

// you can mock any middlewares here if necessary

const props = {
  navigation: { navigate: jest.fn() },
  dispatch: jest.fn(),
  connectUserData: {
    photo: '',
    name: 'Test',
  },
};

describe('Testing PreviewConnectionScreen', () => {
  it('renders as expected', () => {
    const wrapper = renderer.create(<PreviewConnectionScreen {...props} />);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
